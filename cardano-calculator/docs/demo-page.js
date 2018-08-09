function __DemoPageConstructor() {

    function parseElValue($el, val = $el.val() || '0') {
        return $el.attr('valtype') === 'float' ? parseFloat(val) : parseInt(val);
    }

    function indexFieldDependencies(field_dependencies) {
        let result = {};
        field_dependencies.forEach(function (bind) {
            let [idA, idB, fn] = bind;
            if (!result[idA]) {
                result[idA] = [];
            }
            if (!result[idB]) {
                result[idB] = [];
            }
            result[idA].push(bind);
            result[idB].push(bind);
        });
        return result;
    }

    this.bind = function (params, {update, field_dependencies = [], charts = []} = {}) {
        Object.entries(params).forEach(function ([k, v]) {
            $('#' + k).val(v);
        });
        let field_dep_index = indexFieldDependencies(field_dependencies);
        function updateView(params) {
            $('span.result').each(function () {
                $this = $(this);
                $this.text(params[$this.attr('id')]);
            });
            if (charts) {
                if (window.chart) {
                    window.chart.forEach((c) => c.destroy());
                }
                window.chart = charts.map(function ([id, fn]) {
                    return fn(id, params);
                })
            }
        }
        $('input').on("change paste keyup", function () {
            $this = $(this);
            let id = $this.attr('id');
            let val = parseElValue($this);
            console.log('1: ', id, val);
            if (field_dep_index[id]) {
                field_dep_index[id].forEach(function ([idA, idB, fn]) {
                    if (id === idA || id === idB) {
                        let $a = id === idA ? $this : $('#' + idA);
                        let $b = id === idB ? $this : $('#' + idB);
                        let aVal = id === idA ? val : parseElValue($a);
                        let bVal = id === idB ? val : parseElValue($b);
                        if (!fn(aVal, bVal)) {
                            if (id === idA) {
                                $b.val(bVal = aVal);
                            } else {
                                $a.val(aVal = bVal);
                            }
                        }
                        params[idA] = aVal;
                        params[idB] = bVal;
                    }
                });
            } else {
                params[id] = val;
            }
            update(params);
            updateView(params);
        });
        update(params);
        updateView(params);
    }
}

const DemoPage = Object.freeze(new __DemoPageConstructor());
