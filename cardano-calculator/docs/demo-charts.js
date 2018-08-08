function __ChartsConstructor() {

    const COLORS = {
        black: 'rgb(0, 0, 0)',
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        aqua: 'rgb(0, 255, 255)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        brown: 'rgb(165, 42, 42)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)',
        cadet: 'rgb(95, 158, 160)'
    };
    const COLOR_ARR = Object.values(COLORS);

    let __defaultUpdateFn = null;

    this.setDefaultUpdateFn = function (f) {
        __defaultUpdateFn = f;
    };

    function round(val) {
        return Number(Math.round(val+'e11')+'e-11');
    }

    this.plotDataAndCreateChart = function(canvasId, params,
            {ySteps = [], xSteps = [], yId = '', xId = '', yName = yId, xName = xId, title = '', strict = false,
             updateFn = __defaultUpdateFn, expectedMax, middleLineTitle} = {}) {
        if (!updateFn) {
            throw "Update function is required!"
        }
        return createChart(canvasId, {
            title: title,
            xName: xName,
            labels: xSteps,
            expectedMax: expectedMax,
            datasets: createDatasetFromSteps(params, updateFn, ySteps, xSteps, yName, (y,x) => {
                let r = {};
                r[yId] = y;
                r[xId] = x;
                return r;
            }, strict, middleLineTitle ? {title: middleLineTitle, expectedMax: expectedMax} : undefined)
        });
    };

    function createDatasetFromSteps(params, updateFn, ySteps, xSteps, yLabel, f, strict = false, middleLine) {
        let datasets = ySteps.map(function (y, idx) {
            return {
                label: yLabel + ' = ' + y,
                fill: false,
                lineTension: 0.2,
                borderColor: COLOR_ARR[idx],
                backgroundColor: COLOR_ARR[idx],
                data: xSteps.map(function (x) {
                    return updateFn(Object.assign(Object.create(params), f(y, x)), strict).H;
                })
            };
        });
        if (middleLine && middleLine.expectedMax) {
            let {title = '', expectedMax} = middleLine;
            datasets.push({
                label: title,
                fill: false,
                lineTension: 0,
                borderColor: 'rgb(200, 200, 200)',
                backgroundColor: 'rgb(200, 200, 200)',
                data: Array.apply(null, Array(datasets[0].data.length)).map(x => round(expectedMax / 2)),
                pointRadius: 0
            });
        }
        return datasets;
    }

    function createChart(canvasId, {labels = [], datasets = [], xName = '', title = '', expectedMax = 1} = {}) {
        let ctx = document.getElementById(canvasId).getContext('2d');
        let max = Math.max.apply(null, datasets.map(d => d.data.filter(x => !Number.isNaN(x))).flat());
        return Chart.Line(ctx, {
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                title: {
                    display: true,
                    text: title
                },
                animation: {
                    duration: 0
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: xName
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'H'
                        },
                        ticks : {
                            beginAtZero : true,
                            max: Math.max(max, expectedMax)
                        }
                    }]
                }
            }
        });
    }
}

const DemoCharts = Object.freeze(new __ChartsConstructor());
