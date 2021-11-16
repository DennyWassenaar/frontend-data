// JS FOR MOVIE_CREATOR.HTML -------------------------------------------------

    var vWidth = 550;
    var vHeight = 320;
    
    var margin = {top: 10, right: 30, bottom: 50, left: 100},
    width = 430 - margin.left - margin.right,
    height = 170 - margin.top - margin.bottom;

    
    // SCATTERPLOT FOR GROSS AND BUDGET ---------------------------------------
    bubblechart()
    function bubblechart(){

       var margin1 = {top: 30, right: 20, bottom: 30, left: 50},
        width1 = 600 - margin1.left - margin1.right,
        height1 = 400 - margin1.top - margin1.bottom;

       d3.select("#scatterplot").selectAll("p").remove();

       // append the svg object to the body of the page
       var svgBC = d3.select("#scatterplot")
         .append("svg")
           .attr("width", width1+60 + margin1.left + margin1.right)
           .attr("height", height1 + margin1.top + margin1.bottom)
           .style("position","center")
         .append("g")
           .attr("transform",
                 "translate(" + (margin1.left+80) + "," + margin1.top + ")");

       var myRows =[];
       //Read the data
       d3.csv("data/genre_df.csv", function(data) {

         for (i in data){
           d = data[i];
           myRows[myRows.length] = d;        
         } 

         // Add X axis
         var x1 = d3.scaleLinear()
           .domain([0, d3.max(myRows, function(d) { return +d["gross"] }) ] )
           .range([ 0, width1 ])
         svgBC.append("g")
           .attr("class","sc_x")
           .attr("transform", "translate(0," + (height1) + ")")
           .call(d3.axisBottom(x1));
         svgBC.append("text")
           .attr("text-anchor", "end")
           .attr("x", "-.8em")
           .attr("y", ".15em")
           .attr("transform", "rotate(-90)")
           .style("font-family","Lucida Sans Unicode, Lucida Grande, sans-serif");

         // Add Y axis
         var y1 = d3.scaleLinear()
           .domain([0, d3.max(myRows, function(d) { return Math.log(d['budget']) }) ])
           .range([ height1, 0]);
         svgBC.append("g")
           .call(d3.axisLeft(y1));
         svgBC.append("text")
           .attr("text-anchor", "end")
           .attr("transform", "rotate(-90)")
           .attr("y", ".15em")
           .attr("x", "-.8em")
           .style("font-family","Lucida Sans Unicode, Lucida Grande, sans-serif")


        // Add X axis label:
            svgBC.append("text")
                .attr("text-anchor", "end")
                .attr("x", width1)
                .attr("y", height1)
                .style("fill","crimson")
                .text("Gross");

            // Y axis label:
            svgBC.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin1.left+20)
                .attr("x", -margin1.top+40)
                .style("fill","crimson")
                .text("Logarithm of Budget");   

        // Add a scale for bubble size
         var z = d3.scaleLinear()
           .domain([0, d3.max(myRows, function(d) { return +d["gross"] }) ])
           .range([0, d3.max(myRows, function(d) { return +d["gross"] }) ]);

      // Add dots
      svgBC.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("class", "bubbles")
          .attr("cx", function (d) { return x1(d['gross']); } )
          .attr("cy", function (d) { return y1(Math.log(d['budget'])); } )
          .attr("r", function (d) { return 1; } )
          .style("stroke", function (d) { return "crimson"; } )
        // -3- Trigger the functions
        //.on("mouseover", showTooltip )
        //.on("mousemove", moveTooltip )
        //.on("mouseleave", hideTooltip )

       })
    }
    
    
    // Prepare the circle pack space ---------------------------------------------------------------
    var circle_g = d3.select("#circlepck").select('svg').attr('width', vWidth-margin.left).attr('height', vHeight+50).select('g');
    
    // prepare line graph axes ------------------------------------------------------------------
    var parseDate = d3.timeParse("%Y"); // Parse the date / time
    const colorScheme = d3.scaleOrdinal(d3.schemeCategory20); //.range(d3.schemeSet3);
   
    all_data={};
    
    // Get the data from our CSV file -----------------------------------------------------------
    d3.json('data/genre.json', function(error, vCsvData) {
        if (error) throw error;
        
        all_data = vCsvData;
        var vData = genCirclePackData(vCsvData.genre);
        drawViz(vData, circle_g);
    });
    
    // FUNCTION GENERATES LINE PLOT FOR GROSS ACROSS TIMELINE FOR SELECTED GENRE
    function genGrossLinePlot(data, svg, genre) {
        // format the data
        
        new_data = '';
        flag=0;
        for(row in data){
            for(key in data[row]){
                if(key == genre){
                    new_data = data[row][key];
                }
            }
        }
        
        // Set the ranges
        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);


        // Define the line
        var valueline = d3.line()
            .x(function(d) { 
                year=0;
                for(key in d){
                    year = key;
                }
                return x(year); 
            })
            .y(function(d) { 
                gross=0;
                for(key in d){
                    gross = d[key];
                }
                return y(gross); 
            });
        
        // Scale the range of the data
        x.domain(d3.extent(new_data, function(d) {
            year=0;
            for(key in d){
                year = key;
            }
            return year; 
        }));
        
        y.domain([0, d3.max(new_data, function(d) { 
            gross=0;
            for(key in d){
                gross = d[key];    
            }
            return gross; 
        })]);

        // Add the valueline path.
        var path = svg.append("path")
           .data([new_data])
           .attr("class", "line")
           .attr("d", valueline)
           .style('stroke', colorScheme(genre));
        
        // Variable to Hold Total Length
        var totalLength = path.node().getTotalLength();

        // Set Properties of Dash Array and Dash Offset and initiate Transition
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition() // Call Transition Method
            .duration(4000) // Set Duration timing (ms)
            .ease(d3.easeLinear) // Set Easing option
            .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition
        
        
        // Add the X Axis
        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0," + height + ")")
           .call(d3.axisBottom(x).tickFormat(d3.timeFormat(parseDate)))
           .selectAll("text")	
           .data(new_data)
           .style("text-anchor", "end")
           .attr("dx", "-.8em")
           .attr("dy", ".15em")
           .attr("transform", "rotate(-90)")
           .text(function(d,i){
                year=0;
                if(i==0){
                    year=1986
                }
                else if(i==1){
                   year = 1991
                }
                else if(i==2){
                    year=1996
                }
                else if(i==3){
                    year=2001
                }
                else if(i==4){
                    year=2006
                }
                else if(i==5){
                    year=2011
                }
                else if(i==6){
                    year=2016
                }
                return year;
            });

        // Add the Y Axis
        svg.append("g")
           .attr("class", "axis")
           .data(new_data)
           .call(d3.axisLeft(y));
        
        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 40)
            .text("Year");

        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left+20)
            .attr("x", -margin.top)
            .text("Avg. Gross");

    }
    
    // FUNCTION GENERATES LINE PLOT FOR BUDGET ACROSS TIMELINE FOR SELECTED GENRE
    function genBudgetLinePlot(data, svg, genre) {
        // format the data
        
        new_data = '';
        for(row in data){
            for(key in data[row]){    
                if(key == genre){
                    new_data = data[row][key];
                }
            }
        }
        
        // Set the ranges
        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);


        // Define the line
        var valueline = d3.line()
            .x(function(d) { 
                year=0;
                for(key in d){
                    year = key;
                }
                return x(year); 
            })
            .y(function(d) { 
                budget=0;
                for(key in d){
                    budget = d[key];
                }
                return y(budget); 
            });
        
        // Scale the range of the data
        x.domain(d3.extent(new_data, function(d) {
            year=0;
            for(key in d){
                year = key;
            }
            return year; 
        }));
        y.domain([0, d3.max(new_data, function(d) { 
            budget=0;
            for(key in d){
                budget = d[key];    
            }
            return budget; 
        })]);

        // Add the valueline path.
        var path = svg.append("path")
           .data([new_data])
           .attr("class", "line")
           .attr("d", valueline)
           .style('stroke', colorScheme(genre));
        
        // Variable to Hold Total Length
        var totalLength = path.node().getTotalLength();

        // Set Properties of Dash Array and Dash Offset and initiate Transition
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition() // Call Transition Method
            .duration(4000) // Set Duration timing (ms)
            .ease(d3.easeLinear) // Set Easing option
            .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition

        // Add the X Axis
        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x).tickFormat(d3.timeFormat(parseDate)))
           .selectAll("text")
           .data(new_data)
           .style("text-anchor", "end")
           .attr("dx", "-.8em")
           .attr("dy", ".15em")
           .attr("transform", "rotate(-90)")
           .text(function(d,i){
               year=0;
                if(i==0){
                    year=1986
                }
                else if(i==1){
                   year = 1991
                }
                else if(i==2){
                    year=1996
                }
                else if(i==3){
                    year=2001
                }
                else if(i==4){
                    year=2006
                }
                else if(i==5){
                    year=2011
                }
                else if(i==6){
                    year=2016
                }
                return year;
            });

        // Add the Y Axis
        svg.append("g")
           .attr("class", "axis")
           .call(d3.axisLeft(y));
        
        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 40)
            .text("Year");

        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left+20)
            .attr("x", -margin.top)
            .text("Avg. Budget");

    }
    
    // FUNCTION GENERATES LINE PLOT FOR IMDB SCORE ACROSS TIMELINE FOR SELECTED GENRE
    function genImdbLinePlot(data, svg, genre) {
        // format the data
        
        new_data = '';
        flag=0;
        for(row in data){
            for(key in data[row]){
                if(key == genre){
                    new_data = data[row][key];
                }
            }
        }
        
        // Set the ranges
        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);


        // Define the line
        var valueline = d3.line()
            .x(function(d) { 
                year=0;
                for(key in d){
                    year = key;
                }
                return x(year); 
            })
            .y(function(d) { 
                imdb=0;
                for(key in d){
                    imdb = d[key];
                }
                return y(imdb); 
            });
        
        // Scale the range of the data
        x.domain(d3.extent(new_data, function(d) {
            year=0;
            for(key in d){
                year = key;
            }
            return year; 
        }));
        y.domain([0, d3.max(new_data, function(d) { 
            imdb=0;
            for(key in d){
                imdb = d[key];    
            }
            return imdb; 
        })]);

        // Add the valueline path.
        var path = svg.append("path")
           .data([new_data])
           .attr("class", "line")
           .attr("d", valueline)
           .style('stroke', colorScheme(genre));
        
        // Variable to Hold Total Length
        var totalLength = path.node().getTotalLength();

        // Set Properties of Dash Array and Dash Offset and initiate Transition
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition() // Call Transition Method
            .duration(4000) // Set Duration timing (ms)
            .ease(d3.easeLinear) // Set Easing option
            .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition

        // Add the X Axis
        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat(parseDate)))
           .selectAll("text")	
           .data(new_data)
           .style("text-anchor", "end")
           .attr("dx", "-.8em")
           .attr("dy", ".15em")
           .attr("transform", "rotate(-90)")
           .text(function(d,i){
                year=0;
                if(i==0){
                    year=1986
                }
                else if(i==1){
                   year = 1991
                }
                else if(i==2){
                    year=1996
                }
                else if(i==3){
                    year=2001
                }
                else if(i==4){
                    year=2006
                }
                else if(i==5){
                    year=2011
                }
                else if(i==6){
                    year=2016
                }
                return year;
            });

        // Add the Y Axis
        svg.append("g")
           .attr("class", "axis")
           .call(d3.axisLeft(y));
        
        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 40)
            .text("Year");

        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left+20)
            .attr("x", -margin.top)
            .text("Avg. IMDB Score");

    }
    
    // FUNCTION GENERATES LINE PLOT FOR NUMBER OF CRITIC REVIEWS ACROSS TIMELINE FOR SELECTED GENRE
    function genReviewLinePlot(data, svg, genre) {
        // format the data
        
        new_data = '';
        flag=0;
        for(row in data){
            for(key in data[row]){
                if(key == genre){
                    new_data = data[row][key];
                }
            }
        }
        
        // Set the ranges
        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);


        // Define the line
        var valueline = d3.line()
            .x(function(d) { 
                year=0;
                for(key in d){
                    year = key;
                }
                return x(year); 
            })
            .y(function(d) { 
                review=0;
                for(key in d){
                    review = d[key];
                }
                return y(review); 
            });
        
        // Scale the range of the data
        x.domain(d3.extent(new_data, function(d) {
            year=0;
            for(key in d){
                year = key;
            }
            return year; 
        }));
        y.domain([0, d3.max(new_data, function(d) { 
            review=0;
            for(key in d){
                review = d[key];    
            }
            return review; 
        })]);

        // Add the valueline path.
        var path = svg.append("path")
           .data([new_data])
           .attr("class", "line")
           .attr("d", valueline)
           .style('stroke', colorScheme(genre));
        
        // Variable to Hold Total Length
        var totalLength = path.node().getTotalLength();

        // Set Properties of Dash Array and Dash Offset and initiate Transition
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition() // Call Transition Method
            .duration(4000) // Set Duration timing (ms)
            .ease(d3.easeLinear) // Set Easing option
            .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition

        // Add the X Axis
        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat(parseDate)))
           .selectAll("text")	
           .data(new_data)
           .style("text-anchor", "end")
           .attr("dx", "-.8em")
           .attr("dy", ".15em")
           .attr("transform", "rotate(-90)")
           .text(function(d,i){
                year=0;
                if(i==0){
                    year=1986
                }
                else if(i==1){
                   year = 1991
                }
                else if(i==2){
                    year=1996
                }
                else if(i==3){
                    year=2001
                }
                else if(i==4){
                    year=2006
                }
                else if(i==5){
                    year=2011
                }
                else if(i==6){
                    year=2016
                }
                return year;
            });

        // Add the Y Axis
        svg.append("g")
           .attr("class", "axis")
           .call(d3.axisLeft(y));
        
        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 40)
            .text("Year");

        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left+20)
            .attr("x", -margin.top+20)
            .text("Avg. No. of Critic Reviews");

    }
    
    // FUNCTION GENRATES THE DATA FOR circle pack diagram
    function genCirclePackData(data) {

        var vData = { name: "genre", children: data };
    
        return vData;
    }

    // FUNCTION GENERATES THE VIZ (circle pack diagram)
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
                d3.select("#barplot svg").remove(); // only for 1st iteration
                  
                d3.select("#gross svg").remove();
                d3.select("#budget svg").remove();
                d3.select("#imdb svg").remove();
                d3.select("#review svg").remove();
                
                d3.select("#barplot").append("div").attr("id","gross")
                d3.select("#barplot").append("div").attr("id","budget")
                d3.select("#barplot").append("div").attr("id","imdb")
                d3.select("#barplot").append("div").attr("id","review")
                
                var gross_line_svg = d3.select("#barplot")
                     .select("#gross")
                     .append("svg")
                     .attr("width", width + margin.left + margin.right)
                     .attr("height", height + margin.top + margin.bottom)
                     .append("g")
                     .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");
    
                var budget_line_svg = d3.select("#barplot")
                                 .select("#budget")
                                 .append("svg")
                                 .attr("width", width + margin.left + margin.right)
                                 .attr("height", height + margin.top + margin.bottom)
                                 .append("g")
                                 .attr("transform",
                                      "translate(" + margin.left + "," + margin.top + ")");

                var imdb_line_svg = d3.select("#barplot")
                                 .select("#imdb")
                                 .append("svg")
                                 .attr("width", width + margin.left + margin.right)
                                 .attr("height", height + margin.top + margin.bottom)
                                 .append("g")
                                 .attr("transform",
                                      "translate(" + margin.left + "," + margin.top + ")");

                var review_line_svg = d3.select("#barplot")
                                 .select("#review")
                                 .append("svg")
                                 .attr("width", width + margin.left + margin.right)
                                 .attr("height", height + margin.top + margin.bottom)
                                 .append("g")
                                 .attr("transform",
                                      "translate(" + margin.left + "," + margin.top + ")");
                
                genre = key;
            
                genGrossLinePlot(all_data.gross, gross_line_svg, genre);
                genBudgetLinePlot(all_data.budget, budget_line_svg, genre);
                genImdbLinePlot(all_data.imdb, imdb_line_svg, genre);
                genReviewLinePlot(all_data.critic_review, review_line_svg, genre);
                
                d3.select(".legendCells").selectAll(".cell").attr("opacity","0.2");
            }
        })
        .on("mouseover", function(thisElement, index){
                // grey out all legends                                   
                genre = '';
                for(key in thisElement.data){
                   // console.log(key);
                   genre = key;
                }
                
                d3.selectAll(".cell").attr("opacity", function(d){
                    value = 0.2;
                    if (d==genre){
                        value=1;
                    }
                    return value;
                });
               
        })
        .on("mouseout", function(thisElement, index){
                d3.select(".legendCells").selectAll(".cell").attr("opacity","1"); // back to normal

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
        
        // Draw on screen -----------------------------------------------
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
        
        // Legend ----------------------------------------------
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
                           return labels[d.i]; 
                        })
                       .shapePadding(0)
                       .scale(colorScheme);

        space.select(".legendThreshold")
            .call(legend);        
       
    }
    
