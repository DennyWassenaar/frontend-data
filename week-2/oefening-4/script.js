
// Setting up the top level SVG
var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;


var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Creating and appending Tool Tip in body
var tooltip = d3.select("body").append("div").attr("class", "toolTip");


// Reading CSV
d3.csv("Top-100-IMDB.csv").get( (error, data) => {

    if (error) throw error;


    // Setting up the scaling
    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

    // Setting up Axes
    x.domain(data.map( (d) => { return d.Position; }));
    y.domain([10000, 2000000]);


    // Labelling X-axis
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Labelling Y-axis
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y)
        .ticks(20)
        .tickFormat(d3.formatPrefix(".1", 1e6)))
        .append("text")
        .attr("class", "axis--y-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("No. of Reviews");

    // Assigning <g> attributes and appending Bins of Histogram
    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d) => {
            return x(d.Position);
        })
        .attr("y", (d) => {
            return y(d.Votes); 
        })
        .attr("width", x.bandwidth())
        .attr("height", (d) => {
            return height - y(d.Votes); 
        });


        // Tooltip setup
        g.selectAll(".bar").on("mousemove", (d) =>{
            tooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 90 + "px")
                .style("display", "inline-block")
                .html(("Rating: " + d.Rating) + "<br><span>" + (d.Title) + "</span>");
        });
        g.selectAll(".bar").on("mouseout", (d) =>{
            tooltip.style("display", "none");
        });

});

function updateData(selectedValue){

    // Removing widths and heights with animation of Bins
    g.selectAll(".bar")
                    .transition()
                    .duration(300)
                    .attr("width", 0).remove()
                    .attr("height", 0).remove();

    // Deleting all the Bins
    g.selectAll(".bar").remove();
    var tooltip = d3.select(".toolTip");

    switch(selectedValue){

        case "1":

            // Reading the CSV File
            d3.csv("Top-100-IMDB.csv").get((error, data) =>{
    
                if (error) throw error;

                // Sorting data in Ascending order based on Rating
                data.sort(function(a, b){
                    return b.Rating - a.Rating
                });

                // Setting up the scaling
                var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
                y = d3.scaleLinear().rangeRound([height, 0]);

                // Setting up X-Axis values
                x.domain(data.map( (d) => {

                    return d.Position;
                }));

                // Setting up Y-axis values
                y.domain([10000, 2000000]);

                // Assigning <g> attributes and appending Bins of Histogram
                g.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .transition()
                    .duration(800)
                    .delay( (d,i) => { return i*25})
                    .attr("x", (d) =>  {

                        return x(d.Position);
                    })
                    .attr("y", (d) =>  {
                        
                        return y(d.Votes); 
                    })
                    .attr("width", x.bandwidth())
                    .attr("height",  (d) => {

                        return height - y(d.Votes); 
                    });

                // Tooltip setup
                g.selectAll(".bar").on("mousemove", (d, error) => {

                    console.log(error);
                    tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 90 + "px")
                    .style("display", "inline-block")
                    .html(("Rating: " + d.Rating) + "<br><span>" + (d.Title) + "</span>");
                })
                .on("mouseout",  (d) => {
                    tooltip.style("display", "none");
                });

            });

        break;
        
        case "2":

            // Reading the CSV File
            d3.csv("Top-100-IMDB.csv").get( (error, data) => {
    
                if (error) throw error;

                // Sorting data in Ascending order based on Release Year
                data.sort( (a, b) => {
                    return parseInt(a.Year) - parseInt(b.Year)
                });

                // Setting up the scaling
                var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
                y = d3.scaleLinear().rangeRound([height, 0]);

                // Setting up X-Axis values
                x.domain(data.map( (d) => {

                    return d.Position;
                }));

                // Setting up Y-axis values
                y.domain([10000, 2000000]);

                // Assigning <g> attributes and appending Bins of Histogram
                g.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .transition()
                    .duration(800)
                    .delay( (d,i) => { return i*25})
                    .attr("x",  (d) => {
                        
                        return x(d.Position);
                    })
                    .attr("y", (d) => {
                        
                        return y(d.Votes); 
                    })
                    .attr("width", x.bandwidth())
                    .attr("height", (d) => {
                        
                        return height - y(d.Votes); 
                    });

                    // Tooltip setup
                    g.selectAll(".bar").on("mousemove", (d, error) => {
                        
                        console.log(error);
                        tooltip
                        .style("left", d3.event.pageX - 50 + "px")
                        .style("top", d3.event.pageY - 90 + "px")
                        .style("display", "inline-block")
                        .html(("Rating: " + d.Rating + "<br>" + "Year: "+ d.Year) + "<br><span>" + (d.Title) + "</span>");
                    })
                    .on("mouseout", (d) => {
                        tooltip.style("display", "none");
                });

            });

        break;

        case "3":

            // Reading the CSV File
            d3.csv("Top-100-IMDB.csv").get( (error, data) => {
    
                if (error) throw error;

                // Sorting data in Ascending order based on Release Year
                data.sort( (a, b) => {
                    return b.Votes  - a.Votes
                });


                // Setting up the scaling
                var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
                y = d3.scaleLinear().rangeRound([height, 0]);


                // Setting up X-Axis values
                x.domain(data.map( (d) => {

                    return d.Position;
                }));

                // Setting up Y-axis values
                y.domain([10000, 2000000]);

                data.sort( (a, b) => {
                    return b.Rating - a.Rating
                });

                // Assigning <g> attributes and appending Bins of Histogram
                g.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .transition()
                    .duration(800)
                    .delay(function(d,i){ return i*25})
                    .attr("x", function(d) {
                        return x(d.Position);
                    })
                    .attr("y", function(d) {
                    return y(d.Votes); 
                    })
                    .attr("width", x.bandwidth())
                    .attr("height", function(d) {
                    return height - y(d.Votes); 
                });

                // Tooltip setup
                g.selectAll(".bar").on("mousemove", function(d, error){

                    console.log(error);
                    tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 90 + "px")
                    .style("display", "inline-block")
                    .html(("Rating: " + d.Rating) + "<br><span>" + (d.Title) + "</span>");
                })
                .on("mouseout", function(d){
                    tooltip.style("display", "none");
                });

            });

        break;

        case "4":

            // Reading the CSV File
            d3.csv("Top-100-IMDB.csv").get(function(error, data) {
    
                if (error) throw error;

                // Sorting data in Ascending order based on Release Year
                data.sort(function(a, b){
                    return parseInt(b.Runtime)  - parseInt(a.Runtime)
                });


                // Setting up the scaling
                var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
                y = d3.scaleLinear().rangeRound([height, 0]);


                // Setting up X-Axis values
                x.domain(data.map(function(d){

                    return d.Position;
                }));

                // Setting up Y-axis values
                y.domain([10000, 2000000]);

                data.sort(function(a, b){
                    return b.Rating - a.Rating
                });


                // Assigning <g> attributes and appending Bins of Histogram
                g.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .transition()
                    .duration(800)
                    .delay(function(d,i){ return i*25})
                    .attr("x", function(d) {
                    
                        return x(d.Position);
                    })
                    .attr("y", function(d) {
                    
                        return y(d.Votes); 
                    })
                    .attr("width", x.bandwidth())
                    .attr("height", function(d) {
                    
                        return height - y(d.Votes); 
                    });


                // Tooltip setup
                g.selectAll(".bar").on("mousemove", function(d, error){

                    console.log(error);
                    tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 90 + "px")
                    .style("display", "inline-block")
                    .html(("Rating: " + d.Rating) + "<br> Running Time: "+ d.Runtime+ " Min<br><span>" + (d.Title) + "</span>");
                })
                .on("mouseout", function(d){
                    tooltip.style("display", "none");
                });

            });
        
        break;
    }
}   