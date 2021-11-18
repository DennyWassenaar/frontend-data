
var vWidth = 550;
var vHeight = 320;

var margin = { top: 10, right: 30, bottom: 50, left: 100 },
    width = 430 - margin.left - margin.right,
    height = 170 - margin.top - margin.bottom;


// Cirkel element selecteren en daar een SVG met waardes aan toevoegen
var circle_g = d3.select("#circlepck").select('svg').attr('width', vWidth - margin.left).attr('height', vHeight + 50).select('g');

// prepare line graph axes ------------------------------------------------------------------
const colorScheme = d3.scaleOrdinal(d3.schemeCategory20);

all_data = {};

// Data ophalen
d3.json('data/genre.json', function (error, vCsvData) {
    if (error) throw error;

    all_data = vCsvData;
    var vData = genCirclePackData(vCsvData.genre);
    drawViz(vData, circle_g);
});

// functie voor het aanmaken van data voor de cirkeldiagram
function genCirclePackData(data) {

    var vData = { name: "genre", children: data };

    return vData;
}


function drawViz(vData, space) {

    var vLayout = d3.pack().size([vWidth, vHeight]);


    var vRoot = d3.hierarchy(vData).sum(function (d) {
        var value = 0
        for (key in d) {
            if (key != "genre" && key != "children") {
                value = d[key];
            }
            else {
                value = d.children;
            }
        }
        return value;
    });

    var vNodes = vRoot.descendants();
    vLayout(vRoot);

    var vSlices = space.selectAll('circle').data(vNodes).enter().append('circle').on("click", function (d) {
        for (key in d.data) {
            d3.select("#wordcloud svg").remove(); // only for 1st iteration
            wordcloud(key)

            d3.select(".legendCells").selectAll(".cell").attr("opacity", "0.2");
        }
    })
        .on("mouseover", function (thisElement, index) {                                 
            genre = '';
            for (key in thisElement.data) {
                genre = key;
            }
            d3.selectAll(".cell").attr("opacity", function (d) {
                value = 0.2;
                if (d == genre) {
                    value = 1;
                }
                return value;
            });
        })
        .on("mouseout", function (thisElement, index) {
            d3.select(".legendCells").selectAll(".cell").attr("opacity", "1");
        });

    var labels = [];

    for (d in vNodes) {
        for (key in vNodes[d].data) {
            if (key != 'name' && key != 'children') {
                labels.push(key);
            }
        }
    }

    labels.sort();
    colorScheme.domain(labels);
    console.log(labels);

    vSlices.attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', function (d) { return d.r; })
        .style('opacity', 0.9)
        .attr('fill', function (d) {
            cat = '';
            for (key in d.data) {
                if (key != 'name' && key != 'children') {
                    cat = key;
                }
            }
            return colorScheme(cat);
        });

    vSlices.attr("fill", function (d) {
        color = "";
        if (d.x == 275) {
            color = "lightgray";
        }
        else {
            for (key in d.data) {
                if (key != 'name' && key != 'children') {
                    color = colorScheme(key);
                }
            }
        }
        return color;
    });




    var fill = d3.scaleOrdinal(d3.schemeCategory10);

    width = 400;
    height = 300;

    function wordcloud(selectedGenre) {
        var myWords = [];

        svgWC = d3.select("#wordcloud").append("svg")
            .attr("width", 1500)
            .attr("height", 700)
            .append("g")
            .attr("transform",
                "translate(" + 20 + "," + 20 + ")");


        d3.csv("data/moviecloud.csv", function (data) {
            for (i in data) {
                d = data[i];
                if (d['genre'] == selectedGenre) {
                    myWords[myWords.length] = d;
                }
            }

            var layout = d3.layout.cloud()
                .size([width, height])
                .words(myWords.map(function (d) {
                    console.log(d['movie_title']);
                    return { text: d['movie_title'], size: parseFloat(d['imdb_score']), color: fill(d['movie_title']) };
                }))
                .padding(15)        
                .rotate(function () { return ~~(Math.random() * 2) * 90; })
                .fontSize(function (d) {
                    return (2 * d.size);
                })                   
                .on("end", draw);

            layout.start();

        
            function draw(words) {
                console.log(words);
                svgWC
                    .append("g")
                    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", function (d) {
                        return (d.size) + "px";
                    })
                    .style('opacity', 0)
                    .style("fill", function (d) { return d.color; })
                    .attr("text-anchor", "middle")
                    .style("font-family", "Impact")
                    .attr("transform", function (d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function (d) { return d.text; })
                    .transition()
                    .delay(function (d, i) {
                        return i * 15
                    })
                    .style("opacity", 1)
                    ;
            }
        });
    }


    var g = space.append("g")
        .attr("class", "legendThreshold")
        .attr("transform", "translate(10,40)")
        .style("font-size", "12px");

    g.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -6)
        .text("Film genres")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    var legend = d3.legendColor()
        .labels(function (d) {
            var lbl = '';
            if (labels[d.i] != undefined) {
                lbl = labels[d.i];

            }
            return lbl;
        })
        .shapePadding(0)
        .scale(colorScheme);

    space.select(".legendThreshold")
        .call(legend);

}