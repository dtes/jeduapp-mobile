// ##### mb-core
(function ($) {

    // Пространство имен
    $.mb = {};

    // Дилэй для анимаций
    $.mb.animDelay = 40;

    $.mb.ini = {
        themeClass: '$.mb.theme.Base',

        userInfo: {
            id: 0,
            name: 'guest'
        }
    };

})(Dom7);

// ##### mb-request modified
(function ($) {
    $.extend($.mb, {
        request: {
            ajax: function (params) {
                params = $.extend({
                    dataType: 'json',
                    headers: {},
                    complete: function (r, status) {
                        if (params.onComplete) {
                            params.onComplete(r, status);
                        }
                    },
                    beforeSend: function (r, settings) {
                        if (params.onBeforeSend) {
                            params.onBeforeSend(r, settings);
                        }
                    },
                    success: function (data, status, r) {
                        if (data.success == false) {
                            if (params.onError) {
                                params.onError(r, status, data.errors);
                            }
                            return;
                        }
                        if (params.onSuccess) {
                            params.onSuccess(data, status, r);
                        }
                    },
                    error: function (r, status, err) {
                        if (params.onError) {
                            params.onError(r, status, err);
                        }
                    }
                }, params);

                $.extend(params.headers, {
                    "mb-ajax": true,
                });

                return $.ajax(params);
            }
        }
    });
})(Dom7);

// ##### mb-controller
(function ($) {
    $.extend($.mb, {
        controller: {
            get: function (params, requestParams) {
                if (typeof params.url != 'string') {
                    $.mb.showError('Не указан url запроса')
                }

                var jsonParams = $.mb.controller.paramsToJson(params);

                return $.mb.request.ajax($.extend({
                    type: 'get',
                    url: params.url,
                    data: {
                        data: encodeURIComponent(JSON.stringify(jsonParams))
                    }
                }, requestParams));
            },

            post: function (params, requestParams) {
                if (typeof params.url != 'string') {
                    $.mb.showError('Не указан url запроса')
                }

                var jsonParams = $.mb.controller.paramsToJson(params);

                return $.mb.request.ajax($.extend({
                    type: 'post',
                    url: params.url,
                    data: {
                        data: encodeURIComponent(JSON.stringify(jsonParams))
                    },
                    headers: {'mb-ajax': true}
                }, requestParams));
            },

            paramsToJson: function (params) {
                var paramBox = $.mb.cnv.mapToDataBox(params);
                return $.mb.cnv.toJson(paramBox);
            }
        }
    });
})(Dom7);

// ##### mb-utils
(function ($) {

    $.extend($.mb, {
        url: function (url) {
            var th = this;

            //
            if (url.substr(0, 1) == "/" || url.indexOf(':') != -1) {
                return url;
            }

            // Возвращаем путь
            return $$.baseUrl + url;
        },

        urlIsAbsolute: function (url) {
            return (url.indexOf('http://') === 0 || url.indexOf('https://') === 0);
        },

        clearCache: function (url) {
            $.ajax({
                url: url,
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache"
                }
            });
        },

        tml: function () {
            var args = [].slice.call(arguments);

            if (args.length < 1) {
                $.mb.showError("Не указано название темплейта");
                return false;
            }

            var tml;
            if ($.type(args[0]) == 'string') {
                tml = $("#" + args[0]).first();
            } else {
                tml = args[0];
            }

            if (tml.length == 0) {
                $.mb.showError("Темплейт не найден");
                return false;
            }

            var map = {};
            if (args.length > 1) {
                map = args[1];
            }

            //
            return $($.mb.string.subst(tml.html(), map));
        },

        string: {
            format: function (a) {
                var args = [].slice.call(arguments);
                if (this.toString() != '[object Object]') {
                    args.unshift(this.toString());
                }
                var pattern = new RegExp('{([0-' + (args.length - 1) + '])}', 'g');
                return String(args[0]).replace(pattern, function (match, index) {
                    return args[parseInt(index) + 1];
                });
            },

            f: function (a) {
                return $.mb.string.format.apply(this, arguments);
            },

            subst: function () {
                var args = [].slice.call(arguments);

                if (args.length < 1) {
                    throw "Не передана строка";
                }
                var str = args[0];


                if (args.length < 2) {
                    throw "Не передан мап"
                }

                var paramReg = new RegExp('\\:{[a-z]*}', 'g');
                var names = str.match(paramReg);

                if (names) {
                    var map = {};
                    $.each(names, function (i, name) {
                        name = name.replace(/(\:|{|})/g, "");
                        map[name] = "";
                    });

                    $.extend(map, args[1]);

                    var reg;
                    $.each(map, function (k, value) {
                        reg = new RegExp('\\:{' + k + '}', 'g');
                        str = str.replace(reg, value ? value : "");
                    });
                }

                return str;
            },

            startsWith: function (dest, str) {
                return dest.indexOf(str) == 0;
            },

            endsWith: function (dest, str) {
                return dest.indexOf(str, dest.length - str.length) !== -1;
            },

            toBoolean: function (str) {
                return str === 'true';
            }
        },

        cnv: {
            fromJson: function (v, model) {
                var th = this;

                if (!v) {
                    return null;
                } else if (v.type == 'datastore') {
                    return th._jsonToDataStore(v.value, model);
                } else if (v.type == 'datarec') {
                    return th._jsonToDataRecord(v.value, model)
                } else if (v.type == 'databox') {
                    return th._jsonToDatabox(v.value, model)
                } else {
                    return v.value;
                }
            },

            toJson: function (v) {
                var th = this;
                var res = {
                    type: 'null',
                    value: null
                };
                if (v === undefined || v === null) {
                    return res;
                } else if ($.type(v) === 'boolean') {
                    res.type = 'boolean';
                    res.value = v;
                } else if ($.isNumeric(v)) {
                    res.type = 'number';
                    res.value = v;
                } else if ($.type(v) === 'string') {
                    res.type = 'string';
                    res.value = v;
                } else if ($.type(v) === 'array') {
                    res.type = 'list';
                    res.value = v;
                } else if (v instanceof $.mb.model.DataRecord) {
                    res.type = 'datarec';
                    res.value = th._dataRecordToJson(v);
                } else if (v instanceof $.mb.model.DataStore) {
                    res.type = 'datastore';
                    res.value = th._dataStoreToJson(v);
                } else if (v instanceof $.mb.model.DataBox) {
                    res.type = 'databox';
                    res.value = th._databoxToJson(v);
                } else if ($.type(v) === 'date') {


                    //todo Затык стоит - нужно убирать
                    res.type = 'date';
                    res.value = 'jismo';
                    //Ext.Date.format(v, Jc.ini.datetimeFormatServer);
                } else {
                    res.type = 'map';
                    res.value = v;
                }
                return res;
            },

            mapToDataBox: function (v) {
                var dataBox = new $.mb.model.DataBox();
                $.extend(dataBox, v);
                return dataBox;
            },

            _jsonToDataRecord: function (v, model) {
                var rec = new $.mb.model.DataRecord();

                //
                var data = v['data'];
                if (data[0]) {
                    rec.setValues(data[0]);
                }

                //
                var struct = v['struct'];
                if (struct) {
                    rec.setStruct(struct);
                }

                return rec;
            },

            _jsonToDataStore: function (v, model) {
                var struct = v['struct'];
                var store = new $.mb.model.DataStore();
                store.setStruct(struct);
                store.add(v['data']);
                return store;
            },

            _jsonToDatabox: function (v, model) {
                var res = new $.mb.model.DataBox();
                for (var key in v) {
                    res[key] = this.fromJson(v[key], model);
                }
                return res;
            },

            _dataStoreToJson: function (store) {
                var th = this;
                var res = {
                    struct: store.struct,
                    data: th._dataStoreToArray(store)
                };
                if (store.clientdata) {
                    res.clientdata = {};
                    $.extend(res.clientdata, store.clientdata);
                }
                return res;
            },

            _dataStoreToArray: function (store) {
                var th = this;
                var arr = [];
                store.each(function (rec) {
                    arr.push(rec.getValues());
                });
                return arr;
            },

            _dataRecordToJson: function (rec) {
                var res = {
                    struct: rec.struct,
                    data: [rec.getValues()]
                };
                if (rec.clientdata) {
                    res.clientdata = {};
                    $.extend(res.clientdata, rec.clientdata);
                }
                return res;
            },

            _databoxToJson: function (v) {
                var res = {};
                for (var key in v) {
                    var vv = v[key];
                    if ($.isFunction(vv)) continue;
                    if (key.indexOf("$") != -1
                        || key == 'config'
                        || key == 'superclass'
                        || key == 'model'
                        || key == 'daoname'
                        || key == 'daomethod'
                        || key == 'daoparams'
                        || key == 'daoloaded'
                    ) continue;
                    res[key] = this.toJson(vv);
                }
                return res;
            }
        },

        sequence: {
            next: function () {
                return $.mb.str.f('{0}{1}', seqPrefix, seqId++);
            }
        }
    });
    var seqId = 0;
    var seqPrefix = "mb-js-";

    $.mb.str = $.mb.string;
    $.mb.seq = $.mb.sequence;

})(Dom7);

// ##### mb-model
(function ($) {

    $.extend($.mb, {
        model: {
            name: 'default',

            DataRecord: function () {
                $.extend(this, {
                    data: {},
                    struct: {},
                    setValues: function (map) {
                        var th = this;
                        $.extend(th.data, map)
                    },
                    setValue: function (name, value) {
                        var th = this;
                        th.data[name] = value;
                    },
                    set: function (name, value) {
                        var th = this;
                        th.setValue(name, value);
                    },
                    setStruct: function (struct) {
                        var th = this;
                        th.struct = struct;
                    },
                    getValue: function (name) {
                        var th = this;
                        return th.data[name];
                    },
                    get: function (name) {
                        var th = this;
                        return th.getValue(name);
                    },
                    getValues: function () {
                        var th = this;
                        return th.data;
                    },
                    getId: function () {
                        var th = this;
                        return th.getValue('id');
                    }
                });
            },

            DataStore: function () {
                $.extend(this, {
                    curRec: null,
                    data: [],
                    struct: {},
                    add: function (val, toTheTop) {
                        var th = this;
                        var type = $.type(val);
                        if (val instanceof $.mb.model.DataRecord) {
                            toTheTop ? th.data.unshift(val) : th.data.push(val);
                        } else if (type == 'map' || type == 'object') {
                            var rec = new $.mb.model.DataRecord();
                            rec.setValues(val);
                            th.add(rec, toTheTop);
                        } else if (type == 'string') {
                            th.add($.mb.cnv.fromJson(type));
                        } else if ($.type(val) == 'array') {
                            $.each(val, function (i, item) {
                                th.add(item);
                            })
                        }
                    },
                    each: function (callback) {
                        var th = this;
                        $.each(th.data, function (i, rec) {
                            callback(rec)
                        });
                    },
                    find: function (field, value) {
                        var th = this;
                        var res = null;
                        th.each(function (rec) {
                            if (rec.get(field) == value) {
                                res = rec;
                            }
                        });
                        return res;
                    },
                    findByMap: function (map) {
                        var th = this;
                        var res = null;

                        th.each(function (rec) {
                            if (res == null) {
                                var found = true;
                                $.each(map, function (k, v) {
                                    if (rec.get(k) != v) {
                                        found = false;
                                        return false;
                                    }
                                });

                                if (found) {
                                    res = rec;
                                }
                            } else {
                                return false;
                            }
                        });

                        return res;
                    },
                    indexOf: function (rec) {
                        var th = this;
                        return th.data.indexOf(rec);
                    },
                    remove: function (rec) {
                        var th = this;
                        var index = th.indexOf(rec);
                        if (index != -1) {
                            th.removeAt(index);
                        }
                    },
                    removeAt: function (index) {
                        var th = this;
                        if (th.data.length > index) {
                            th.data.splice(index, 1);
                        }
                    },
                    removeAll: function () {
                        var th = this;
                        th.data = [];
                    },
                    getCurRec: function () {
                        var th = this;
                        var res;
                        if (th.curRec) {
                            res = th.curRec;
                        } else if (th.data.length > 0) {
                            res = th.getAt(0);
                        } else {
                            th.add({});
                            res = th.getAt(0);
                        }
                        return res;
                    },
                    getAt: function (index) {
                        var th = this;
                        var res = null;
                        if (th.data[index]) {
                            res = th.data[index];
                        }
                        return res;
                    },
                    setCurRec: function (rec) {
                        var th = this;
                        th.curRec = rec;
                    },
                    setStruct: function (struct) {
                        var th = this;
                        th.struct = struct;
                    },
                    clear: function () {
                        var th = this;
                        th.data = [];
                    },
                    size: function () {
                        var th = this;
                        return th.data.length;
                    },
                    join: function (field, delim) {
                        var th = this;
                        var res = '';
                        th.each(function (rec) {
                            res += delim + rec.get(field);
                        });
                        res = res.length > 0 ? res.substr(delim.length) : res;
                        return res;
                    }
                })
            },

            DataBox: function () {
                $.extend(this, {
                    get: function (key) {
                        var th = this;
                        return th[key];
                    },
                    set: function (key, data) {
                        var th = this;
                        th[key] = data;
                    }
                });
            },

            createStore: function (domain) {
                var res = new $.mb.model.DataStore();
                res.setStruct({name: domain});
                return res;
            },

            createRecord: function (domain) {
                var res = new $.mb.model.DataRecord();
                res.setStruct({name: domain});
                return res;
            },

            daoparamsToJson: function (daoparams) {
                var dp = [];
                if (daoparams) {
                    for (var i = 0; i < daoparams.length; i++) {
                        dp.push($.mb.cnv.toJson(daoparams[i]));
                    }
                }
                return JSON.stringify(dp);
            }
        }
    });

    $.mb.daoinvoke = $.mb.model.daoinvoke;
    $.mb.createStore = $.mb.model.createStore;
    $.mb.createRecord = $.mb.model.createRecord;

})(Dom7);

// ##### mb-shower modified
(function ($) {

    $.extend($.mb, {
        showFrame: function (frameCfg, showCfg) {
            $.mb.app.theme.showFrame(frameCfg, showCfg);
        },

        showError: function (msg, error, config) {
            // $.mb.app.theme.showError(msg, error, config);
            console.error(msg, error, config);
        },

        showDialog: function (config) {
            $.mb.app.theme.showDialog(config);
        },

        showYN: function (msg, onYes, onNo) {
            $.mb.app.theme.showYN(msg, onYes, onNo);
        }
    });

})(Dom7);
