// @TODO: YOUR CODE HERE!
var width = parseInt(d3.select('#scatter') 
    .style("width")) * 1.25;

var height = width * .65;
var margin = 10;
var labelArea = 110;
var padding = 45;

// create SVG object 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// labels x-axis
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

// transform x-axis
var bottomTextX =  (width - labelArea)/2 + labelArea;
var bottomTextY = height - margin - padding;
xText.attr("transform",`translate(
    ${bottomTextX}, 
    ${bottomTextY})`
    );

//x-axis
xText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

xText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Age (Median)");

xText.append("text")
    .attr("y", 19)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Household Income (Median)");

// label y-axis 
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

// transform y-axis
var leftTextX =  margin + padding;
var leftTextY = (height + labelArea) / 2 - labelArea;
yText.attr("transform",`translate(
    ${leftTextX}, 
     ${leftTextY}
    )rotate(-90)`
    );

// y-axis
yText .append("text")
    .attr("y", -22)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

yText .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

yText .append("text")
    .attr("y", 22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");
    
// create Chart
var cRadius;
function adjustRadius() {
  if (width <= 530) {
    cRadius = 7;}
  else { 
    cRadius = 10;}
}
adjustRadius();

// read data.csv
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

function visualize (csvData) {
   var xMin;
   var xMax;
   var yMin;
   var yMax;

   // default data
   var defaultX = "poverty";
   var defaultY = "obesity";

   // toolTips
   var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
            //build text box
            var stateLine = `<div>${d.state}</div>`;
            var yLine = `<div>${defaultY}: ${d[defaultY]}%</div>`;
            if (defaultX === "poverty") {
                xLine = `<div>${defaultX}: ${d[defaultX]}%</div>`}          
            else {
                xLine = `<div>${defaultX}: ${parseFloat(d[Xdefault]).toLocaleString("en")}</div>`;}             
            return stateLine + xLine + yLine  
        });

    // add toolTip to svg
    svg.call(toolTip);

    // update upon axis option clicked
    function  labelUpdate(axis, clickText) {
        // switch active to inactive
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
    
        // switch data on click
        clickText.classed("inactive", false).classed("active", true);
        }

    // ind max/min values for scaling
    function xMinMax() {
      xMin = d3.min(csvData, function(d) {
        return parseFloat(d[defaultX]) * 0.85;
      });
      xMax = d3.max(csvData, function(d) {
        return parseFloat(d[defaultX]) * 1.15;
      });     
    }

    function yMinMax() {
      yMin = d3.min(csvData, function(d) {
        return parseFloat(d[defaultY]) * 0.85;
      });
      yMax = d3.max(csvData, function(d) {
        return parseFloat(d[defaultY]) * 1.15;
      }); 
    }

    // x/y axis calc
    xMinMax();
    yMinMax();

    var xScale = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])

    // create scaled x/y axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // calculate x/y ticks
    function tickCount() {
      if (width <= 530) {
         xAxis.ticks(5);
         yAxis.ticks(5);
      }
      else {
          xAxis.ticks(10);
          yAxis.ticks(10);
      }        
    }
    tickCount();

    // append axis to the svg 
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labelArea})`
        );

    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(
            ${margin + labelArea}, 
            0 )`
        );

    // append the circles for data
    var allCircles = svg.selectAll("g allCircles").data(csvData).enter();

    allCircles.append("circle")
        .attr("cx", function(d) {
            return xScale(d[defaultX]);
        })
        .attr("cy", function(d) {
            return yScale(d[defaultY]);
        })
        .attr("r", cRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d) {
            // show tooltip when mouse is on circle
            toolTip.show(d, this);
            // highlight circle border
            d3.select(this).style("stroke", "#0e0606");
        })
        .on("mouseout", function (d) {
            // remove the tooltip
            toolTip.hide(d);
            // remove the highlight
            d3.select(this).style("stroke", "#0e0606")
        });

        // set state on circles
        allCircles
            .append("text")
            .attr("font-size", cRadius)
            .attr("class", "stateText")
            .attr("dx", function(d) {
               return xScale(d[defaultX]);
            })
            .attr("dy", function(d) {
              // center text
              return yScale(d[defaultY]) + cRadius /3;
            })
            .text(function(d) {
                return d.abbr;
              })

            .on("mouseover", function(d) {
                toolTip.show(d);
                d3.select("." + d.abbr).style("stroke", "#323232");
            })

            .on("mouseout", function(d) {
                toolTip.hide(d);
                d3.select("." + d.abbr).style("stroke", "#e3e3e3");
            });

          // dynamic graph on click
          d3.selectAll(".aText").on("click", function() {
              var self = d3.select(this)

              // select inactive
              if (self.classed("inactive")) {
                // get name and axis
                var axis = self.attr("data-axis")
                var name = self.attr("data-name")

                if (axis === "x") {
                  defaultX = name;

                  // update min/max 
                  xMinMax();
                  xScale.domain([xMin, xMax]);

                  svg.select(".xAxis")
                        .transition().duration(800)
                        .call(xAxis);
                  
                  // update location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function(d) {
                            return xScale(d[defaultX])                
                        });
                  });   

                  d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dx", function(d) {
                            return xScale(d[defaultX])                          
                        });
                  });          
                  labelUpdate(axis, self);
                }

                 // update for Y axis selection 
                else {
                  defaultY = name;

                  // update min/max y
                  yMinMax();
                  yScale.domain([yMin, yMax]);

                  svg.select(".yAxis")
                        .transition().duration(800)
                        .call(yAxis);

                  // update location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cy", function(d) {
                            return yScale(d[defaultY])                
                        });                       
                  });   

                  d3.selectAll(".stateText").each(function() {
                      d3.select(this)
                        .transition().duration(800)
                        .attr("dy", function(d) {
                           // center text
                            return yScale(d[defaultY]) + cRadius/3;                          
                        });
                  });

                  // change the classes 
                  labelUpdate(axis, self);
                }
              }
          });
}