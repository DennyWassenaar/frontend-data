 // JS FOR GENERIC.HTML -----------------------------------------------

    //------ STACKED BAR CHART TIMELINE ---------------------------------------------------------------
    
    // set the dimensions and margins of the graph
    var margin2 = {top: 10, right: 30, bottom: 20, left: 50},
        width2 = 760 - margin2.left - margin2.right,
        height2 = 500 - margin2.top - margin2.bottom;

    // append the svg object to the body of the page
    var stack_svg = d3.select("#stackchart")
      .append("svg")
        .attr("width", width2 + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin2.left + "," + margin2.top  + ")");

    // Parse the Data
    d3.csv("data/stack.csv", function(data) {

      // List of subgroups = header of the csv files = soil condition here
      var subgroups = data.columns.slice(1)

      // List of groups = species here = value of the first column called group -> I show them on the X axis
      var groups = d3.map(data, function(d){return(d.group)}).keys()

      // Add X axis
      var x = d3.scaleBand()
          .domain(groups)
          .range([0, width2-200])
          .padding([0.2])
      stack_svg.append("g")
        .attr("transform", "translate(100," + (height2-100) + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("transform", "translate(-10,20)rotate(-90)");

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, 700])
        .range([ height2-100, 0 ]);
      stack_svg.append("g")
        .attr("transform", "translate(100," + (0) + ")")
        .call(d3.axisLeft(y));
      
     var color = d3.scaleOrdinal()
                   .domain(subgroups)
                   .range(d3.schemeCategory20);
        
     var parseDate = d3.timeParse("%Y"); // Parse the date / time

      //stack the data? --> stack per subgroup
     var stackedData = d3.stack()
                         .keys(subgroups)(data)

      // ----------------
      // Highlight a specific subgroup when hovered
      // ----------------

      // What happens when user hover a bar
      var mouseover = function(d) {
        var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
        var subgroupValue = d.data[subgroupName];
        
        d3.selectAll(".myRect").style("opacity", 0.2)
        d3.selectAll("."+subgroupName)
          .style("opacity", 1)
          
         // grey out all legends                                   
         genre = '';
         genre = subgroupName;
         
         // highlight the selected one
         d3.select(".lineLegendThreshold").select(".legendCells").selectAll(".cell").attr("opacity", function(e){
             value = 0.2;
             if (e==genre){
                 value=1;
             }
             return value;
         });
         
      }

      // When user do not hover anymore
      var mouseleave = function(d) {
        // Back to normal opacity: 0.8
        d3.selectAll(".myRect").style("opacity",0.9)
        d3.select(".lineLegendThreshold").select(".legendCells").selectAll(".cell").attr("opacity","1"); // back to normal
      }

      // Show the bars
      stack_svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
          .attr("fill", function(d) { return color(d.key); })
          .attr("class", function(d){ return "myRect " + d.key }) // Add a class to each subgroup: their name
          .selectAll("rect")
          // enter a second time = loop subgroup per subgroup to add all rectangles
          .data(function(d) { return d; })
          .enter().append("rect")
            .attr("transform", "translate(100," + 0 + ")")
            .attr("x", function(d) { return x(d.data.group); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width",x.bandwidth())
            .attr("stroke", "grey")
          .on("mouseover", mouseover)
          .on("mouseleave", mouseleave)
          .on("click", function(d){
               var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
               var genre = subgroupName;
               
               d3.select("#barplot svg").remove(); // only for 1st iteration
               var plotline_svg = d3.select("#barplot")
                                    .append("svg")
                                    .attr("width", width2 + margin2.left + margin2.right)
                                    .attr("height", height2 + margin2.top + margin2.bottom+ 150)
                                    .append("g")
                                    .attr("transform",
                                          "translate(" + margin2.left + "," + (margin2.top + 150) + ")");   
          
                genLinePlot(data, plotline_svg, genre, width2, height2, margin2);  
          
          })
     
      // GENERATE LINE PLOT FOR GENRE --------------------------------------------------------------------
        
      function genLinePlot(data, svg, genre, width2, height2, margin2) {
            // format the data
            
            new_data = [];
            flag=0;
            
            for(row in data){  
                for(key in data[row]){    
                    if(key == genre){
                        new_data.push([data[row].group, genre, data[row][genre]]);
                    }    
                }   
            }
            
            // Set the ranges
            var x1 = d3.scaleTime()
                      .domain(d3.extent(new_data, function(d) {
                        var year=d[0];
                        return year; 
                        }))
                      .range([0,( width2-400)]);
            var y1 = d3.scaleLinear()
                      .domain([0, d3.max(new_data, function(d) { 
                            review=d[2];
                            return +review; 
                        })])
                      .range([(height2-150), 0]);

            // Define the line
            var valueline = d3.line()
                .x(function(d) { 
                    year=d[0];
                    return x1(year); 
                })
                .y(function(d) { 
                    review=d[2];
                    return y1(review); 
                });

            // Scale the range of the data
            
        

            // Add the valueline path.
            var path = svg.append("path")
               .data([new_data])
               .attr("class", "line")
               .attr("d", valueline)    
               .style('stroke', color(genre))
               .style('fill',"None");

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
               .attr("transform", "translate(0," + (height2-150) + ")")
            .call(d3.axisBottom(x1).tickFormat(d3.timeFormat(parseDate)))
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
//               .attr("transform", "translate(0," + 71 + ")")
               .call(d3.axisLeft(y1));

            // Add X axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", (width2-400))
                .attr("y", height2 - 110 + margin2.top)
                .text("Year");

            // Y axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin2.left+20)
                .attr("x", -margin2.top+20)
                .text(genre);
        }
        
      // Legend
        var g = stack_svg.append("g")
                .attr("class", "lineLegendThreshold")
                .attr("transform", "translate(-40,20)")
                .style("font-size","11px");

        g.append("text")
            .attr("class", "line_caption")
            .attr("x", 0)
            .attr("y", -6)
            .text("Movie Genres")
            .style("font-size","14px")
            .style("font-weight","bold");

        var legend = d3.legendColor()
                       .labels(function (d) {       
                           return subgroups[d.i]; 
                        })
                       .shapePadding(0)
                       .scale(color);

        stack_svg.select(".lineLegendThreshold")
            .call(legend);
    
    });

    
    //------------------- MAP FOR MOVIE BUFFS ----------------------------------------------
    
    // Create a tooltip div that is hidden by default:
    var tooltip = d3.select("#map")
                    .select("svg")
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("color", "white")

    var showTooltip = function(id,amt,conn) {
        tooltip
          .transition()
          .duration(200)
        tooltip
          .style("opacity", 1)
          .style("color","gray")
          .html("<center>------- " + id + " -------</center> <br> Total Trading Amount: " + amt + " <br> Total Connections: " + conn +" ")
          .style("left", ((d3.event.pageX)+10) + "px")
          .style("top", ((d3.event.pageY)+10) + "px")
      }

    var hideTooltip = function(d) {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
      }    
        
    // The svg
    var svg = d3.select("#map").select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    // Map and projection
    var path = d3.geoPath();
    var projection = d3.geoNaturalEarth()
                       .scale(width / 2 / Math.PI)
                       .translate([width / 2, height / 2])
    
    var path = d3.geoPath()
                 .projection(projection);

    // Data and color scale ----------------------------------------
    var data = d3.map();
    var colorScheme = d3.schemeReds[6];
    colorScheme.unshift("#eee")
    var colorScale = d3.scaleThreshold()
                       .domain([1, 6, 11, 26, 101, 1001])
                       .range(colorScheme);

    // Legend -------------------------------------------
    var g = svg.append("g")
        .attr("class", "legendThreshold")
        .attr("transform", "translate(20,20)");

    g.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -6)
        .text("Movie Counts (out of 5000 Movies)");

    var labels = ['0', '1-5', '6-10', '11-25', '26-100', '101-1000', '> 1000'];

    var legend_map = d3.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);

    svg.select(".legendThreshold")
        .call(legend_map);

    // Load external data and boot -----------------------------
    d3.queue()
        .defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
        .defer(d3.csv, "data/generic.csv", function(d) { 
            total = data.get(d.country) || 0
            data.set(d.country, Number(total)+Number(d.count)); 
        })
        .await(ready);

    // READY FUNCTION LOADS THE GEOGRAPHIC MAP TO CREATE A CHOROPLETH -------------------------
    function ready(error, topo) {
        if (error) throw error;
        // Draw the map
        svg.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(topo.features)
            .enter().append("path")
                .attr("fill", function (d){
                    // Pull data for this country
                    count = data.get(d.properties.name) || 0;   // d.id.substr(0,2)
                    // Set the color
                    console.log(colorScale(count));
                    return colorScale(count);
                })
                .attr("d", path)
                .on("mouseover", function(thisElement, index){
                    svg.selectAll("path").attr("opacity", 0.2); // grey out all map                                    
                    d3.select(this).attr("opacity", 1).attr("stroke","white"); // hightlight the one hovering on
            
                    wordcloud(thisElement.properties.name)
                    showTooltip(thisElement.id,10,10);
                })
                .on("mouseout", function(thisElement, index){
                    svg.selectAll("path").attr("opacity", 1); // back to normal   
                    d3.select("#wordcloud svg").remove();
                    
                    d3.select("#wordcloud")
                      .append("svg")
                      .attr("width", 670)
                      .attr("height", 400)
                     .append("text")
                       .attr("x","200")
                       .attr("y","200")
                       .attr("font-size","25")
                       .attr("fill","crimson")
                       .attr("font-weight","bold")
                       .text("Hover on the country to see their")
                   
                     d3.select("#wordcloud").select("svg")
                       .append("text")
                       .attr("x","280")
                       .attr("y","220")
                       .attr("font-size","25")
                       .attr("fill","darkorange")
                       .text("genre preference");
            
                    hideTooltip();
                });

    }
   
    
    var fill = d3.scaleOrdinal(d3.schemeCategory10);
    
    width = 400;
    height = 400;
    
    // FUNCTION GENERATES WORD CLOUD OF GENRES FOR SELECTED COUNTRY -----------------------
    function wordcloud(selectedCountry) {
        var myWords= [];
        d3.select("#wordcloud svg").remove();
        
        // append the svg object to the body of the page
        svgWC = d3.select("#wordcloud").append("svg")
           .attr("width", 400)
           .attr("height", 400)
         .append("g")
           .attr("transform",
                 "translate(" + 20 + "," + 20 + ")");
        
        // Parse the Data
       d3.csv("data/wordcloud.csv", function(data) {
           for (i in data) {
               d = data[i];
               if (d['Country'] == selectedCountry){
                   myWords[myWords.length] = d;
               }
           }
           count_size = 0;
           for(word in myWords){
               count_size = count_size + parseInt(myWords[word].Count);
           }
           
        // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
        // Wordcloud features that are different from one word to the other must be here
        var layout = d3.layout.cloud()
                       .size([width, height])
                       .words(myWords.map(function(d) {
                           return {text: d['Genre'], size:d['Count'], color: fill(d['Genre']) }; 
                       }))
                       .padding(15)        //space between words
                       .rotate(function() { return ~~(Math.random() * 2) * 90; })
                       .fontSize(function(d) { 
                           return 200*d.size/count_size; 
                        })                     // font size of words
                       .on("end", draw);
        
        layout.start(); 

        // This function takes the output of 'layout' above and draw the words
        // Wordcloud features that are THE SAME from one word to the other can be here
        function draw(words) {
        
         svgWC
           .append("g")
             .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
             .selectAll("text")
               .data(words)
             .enter().append("text")
               .style("font-size", function(d) { 
                   return d.size+"px"; 
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
