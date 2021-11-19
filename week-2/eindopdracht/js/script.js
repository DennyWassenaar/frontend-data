
// Visualisatie breedte en hoogte definieren
var vWidth = 850;
var vHeight = 520;

// Margin & paddings definieren
var margin = { top: 10, right: 30, bottom: 50, left: 100 },
    width = 830 - margin.left - margin.right,
    height = 470 - margin.top - margin.bottom;


// Cirkel element selecteren en daar een SVG met waardes aan toevoegen
var circle_g = d3.select("#circlepck").select('svg').attr('width', vWidth - margin.left).attr('height', vHeight + 50).select('g');

// prepare line graph axes ------------------------------------------------------------------
const colorScheme = d3.scaleOrdinal(d3.schemeCategory20);

// Een object definieren
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

// De functie voor de cirkeldiagram visualisatie
function drawViz(vData, space) {

    // Variabele aanmaken 
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

    //console.log(vNodes);
    vLayout(vRoot);

    // Variable aanmaken waarin alle cirkels met data worden toegevoegd en een on click event voor de wordcloud.
    var vSlices = space.selectAll('circle').data(vNodes).enter().append('circle').on("click", function (d) {
        for (key in d.data) {

            // De placeholder tekst verwijderen
            d3.select("#wordcloud svg").remove();
            wordcloud(key)

            d3.select(".legendCells").selectAll(".cell").attr("opacity", "0.2");
        }
    })
        // Mouse over eventje waarbij de cellen die niet actief zijn (dmv een hover) een opacity meekrijgen
        .on("mouseover", function (thisElement, index) {                                 
            genre = '';
            for (key in thisElement.data) {
                genre = key;
            }
            // Alle cell elementen selecteren en daar de opacity property van uitlezen
            d3.selectAll(".cell").attr("opacity", function (d) {
                value = 0.2;
                if (d == genre) {
                    value = 1;
                }
                return value;
            });
        })
        // Wanneer de muis het celletje weer verlaat de opacity weer naar z'n normale staat terugzetten.
        .on("mouseout", function (thisElement, index) {
            d3.select(".legendCells").selectAll(".cell").attr("opacity", "1");
        });

    var labels = [];

    // Loopje door gefilterde data
    for (d in vNodes) {
        for (key in vNodes[d].data) {
            if (key != 'name' && key != 'children') {
                labels.push(key);
            }
        }
    }

    labels.sort();

    // Visualisatie delen attributen meegeven 
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
    
    // Visualisatie cirkels willekeurige kleur meegeven 
    vSlices.attr("fill", function (d) {
        color = "";
        if (d.x == 475) {
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



    // 
    var fill = d3.scaleOrdinal(d3.schemeCategory10);

    // De hoogte en breedte definieren van de Wordcloud visualisatie
    wWidth = 400;
    wHeight = 300;

    // wordcloud genereren adhv het geselecteerde genre
    function wordcloud(selectedGenre) {
        var myWords = [];

        // Element aanmaken met daarin de wordcloud met bijbehorende afmetingen.
        svgWC = d3.select("#wordcloud").append("svg")
            .attr("width", 900)
            .attr("height", 600)
            .append("g")
            .attr("transform",
                "translate(" + 20 + "," + 20 + ")");

        // data ophalen (in dit geval een CSV en deze in een array knallen)
        d3.csv("data/moviecloud.csv", function (data) {
            for (i in data) {
                d = data[i];
                if (d['genre'] == selectedGenre) {
                    myWords[myWords.length] = d;
                }
            }
            
            // wordcloud gebruiken
            var layout = d3.layout.cloud()
                .size([wWidth, wHeight])
                .words(myWords.map(function (d) {
                    //console.log(d['movie_title']);
                    // De teksten genereren in de wordcloud waarbij de grote afhankelijk is van de IMDB score uit de data
                    return { text: d['movie_title'], size: parseFloat(d['imdb_score']), color: fill(d['movie_title']) };
                }))
                .padding(15)        
                .rotate(function () { return ~~(Math.random() * 2) * 90; })
                .fontSize(function (d) {
                    return (3 * d.size);
                })                   
                .on("end", draw);

            layout.start();
        
            function draw(words) {
                //console.log(words);
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
        .style("font-size", "14px");

    g.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -6)
        .text("Film genres")
        .style("font-size", "16px")
        .style("font-weight", "bold");

    // Legenda aanmaken met de d3js legendcolor plugin
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