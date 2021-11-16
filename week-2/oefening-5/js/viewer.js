// JS FOR MOVIE_VIEWER.HTML ----------------------------------------------------

    var vWidth = 550;
    var vHeight = 320;
    
    var margin = {top: 10, right: 30, bottom: 50, left: 100},
    width = 430 - margin.left - margin.right,
    height = 170 - margin.top - margin.bottom;
    
    
    // Prepare the circle pack space ---------------------------------------------------------------
    var circle_g = d3.select("#circlepck").select('svg').attr('width', vWidth-margin.left).attr('height', vHeight+50).select('g');
    
    // prepare line graph axes ------------------------------------------------------------------
    const colorScheme = d3.scaleOrdinal(d3.schemeCategory20); 
   
    all_data={};
    
    // Get the data from our CSV file -----------------------------------------------------------
    d3.json('data/genre.json', function(error, vCsvData) {
        if (error) throw error;
        
        all_data = vCsvData;
        var vData = genCirclePackData(vCsvData.genre);
        drawViz(vData, circle_g);
    });
  
    // FUNCTION GENERATES DATA FOR CIRCLE PACK DIAGRAM --------------
    function genCirclePackData(data) {

        var vData = { name: "genre", children: data };
    
        return vData;
    }

    // FUNCTION GENERATES VIZ FOR CIRCLE PACKED DIAGRAM AND WORD CLOUD
    function drawViz(vData, space) {
        // Declare d3 layout
        var vLayout = d3.pack().size([vWidth, vHeight]);

        // Layout + Data
        var vRoot = d3.hierarchy(vData).sum(function (d) { 
            var value = 0
            for(key in d){
                if (key != "genre" && key != "children"){
                    value = d[key];
                }
                else{
                    value = d.children;
                }
            }
            
            return value; 
        });
        
        var vNodes = vRoot.descendants();
        vLayout(vRoot);
                
        var vSlices = space.selectAll('circle').data(vNodes).enter().append('circle').on("click", function(d){
            for (key in d.data){
                d3.select("#wordcloud svg").remove(); // only for 1st iteration
                wordcloud(key)
                
                d3.select(".legendCells").selectAll(".cell").attr("opacity","0.2");
            }
        })
        .on("mouseover", function(thisElement, index){
                // grey out all legends                                   
                genre = '';
                for(key in thisElement.data){
                   genre = key;
                }
                
                d3.selectAll(".cell").attr("opacity", function(d){
                    value = 0.2;
                    if (d==genre){
                        value=1;
                    }
                    return value;
                });
                

                //showTooltip(thisElement.id,10,10);
        })
        .on("mouseout", function(thisElement, index){
                d3.select(".legendCells").selectAll(".cell").attr("opacity","1"); // back to normal

                //hideTooltip();
        });
        
        var labels = [];
        
        for(d in vNodes){
            for(key in vNodes[d].data){
                if(key != 'name' && key!= 'children'){
                    labels.push(key);
                }
            }
        }
        
        labels.sort();
        colorScheme.domain(labels);
        console.log(labels);
        
        // Draw on screen
        vSlices.attr('cx', function (d) { return d.x; })
               .attr('cy', function (d) { return d.y; })
               .attr('r', function (d) { return d.r; })
               .style('opacity',0.9)
               .attr('fill', function (d) { 
                    cat = '';
                    for(key in d.data){
                        if(key != 'name' && key!= 'children'){
                            cat = key; 
                        }
                    }
                    return colorScheme(cat); 
        });
        
        vSlices.attr("fill", function(d){
            color="";
            if(d.x == 275){
                color="lightgray";
            }
            else {
               for (key in d.data){
                   if(key != 'name' && key!= 'children'){
                      color = colorScheme(key); 
                   }
               }
            }
            return color;
        });
        
        // Encapsulate the word cloud functionality
   
    
        var fill = d3.scaleOrdinal(d3.schemeCategory10);

        width = 400;
        height = 300;

        // FUNCTION GENERATES WORD CLOUD OF MOVIES FOR SELECTED GENRE -----------------------
        function wordcloud(selectedGenre) {
            var myWords= [];
            d3.select("#wordcloud svg").remove();
            
            // append the svg object to the body of the page
            svgWC = d3.select("#wordcloud").append("svg")
               .attr("width", 800)
               .attr("height", 400)
             .append("g")
               .attr("transform",
                     "translate(" + 20 + "," + 20 + ")");

            // Parse the Data
           d3.csv("data/moviecloud.csv", function(data) {
                   for (i in data) {
                       d = data[i];
                       if (d['genre'] == selectedGenre){
                           myWords[myWords.length] = d;
                       }
                   }
          
                    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
                    // Wordcloud features that are different from one word to the other must be here
                    var layout = d3.layout.cloud()
                                   .size([width, height])
                                   .words(myWords.map(function(d) {
                                       console.log(d['movie_title']);
                                       return {text: d['movie_title'], size:parseFloat(d['imdb_score']), color: fill(d['movie_title']) }; 
                                   }))
                                   .padding(15)        //space between words
                                   .rotate(function() { return ~~(Math.random()*2) * 90; })
                                   .fontSize(function(d) { 
                                       return (2*d.size); 
                                    })                     // font size of words
                                   .on("end", draw);
                
                    layout.start(); 

                    // This function takes the output of 'layout' above and draw the words
                    // Wordcloud features that are THE SAME from one word to the other can be here
                    function draw(words) {
                        console.log(words);
                         svgWC
                           .append("g")
                             .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                             .selectAll("text")
                               .data(words)
                             .enter().append("text")
                               .style("font-size", function(d) { 
                                    return (d.size)+"px"; 
                                })
                               .style("fill", function(d) { return d.color; })
                               .attr("text-anchor", "middle")
                               .style("font-family","Impact")
                               .attr("transform", function(d) {
                                 return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                               })
                               .text(function(d) { return d.text; });
                    }
               });     
        }
 
        // Legend -----------------------------------------------
        var g = space.append("g")
                .attr("class", "legendThreshold")
                .attr("transform", "translate(10,40)")
                .style("font-size","12px");

        g.append("text")
            .attr("class", "caption")
            .attr("x", 0)
            .attr("y", -6)
            .text("Movie Genres")
            .style("font-size","14px")
            .style("font-weight","bold");

        var legend = d3.legendColor()
                       .labels(function (d) {       
                           var lbl = '';
                           if(labels[d.i] != undefined){
                               lbl = labels[d.i];
                               
                           }
                           return lbl; 
                        })
                       .shapePadding(0)
                       .scale(colorScheme);

        space.select(".legendThreshold")
            .call(legend);        
       
    }