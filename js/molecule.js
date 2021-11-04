var width = window.innerWidth,
    height = window.innerHeight;

var radius = d3.scale.sqrt()
    .range([0, 6]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .size([width, height])
    .charge(-50)
    .gravity(0.05)
    .linkDistance(function(d) { return radius(d.source.size/50) + radius(d.target.size/100); });

d3.json("data/graph.json", function(error, graph) {
  if (error) throw error;
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .on("tick", tick)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
      .enter().append("g")
      .attr("class", "link");

  link.append("line")
      .style("storke", "#54565A")
      .style("stroke-width", function(d) { return (2 - 1) * 0.2 + "px"; });

//  link.filter(function(d) { return d.bond > 1; }).append("line")
//      .attr("class", "separator");

  var node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

  node.append("circle")
      .attr("r", function(d) { return radius(d.size*0.1); })
      .style("fill", function(d) { return d.color; })
      .style("stroke-width", "0px") ;

  node.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.atom; })
      .style("fill", "white");

  function tick() {
      
    var q = d3.geom.quadtree(graph.nodes),
      i = 0,
      n = graph.nodes.length;

    while (++i < n) q.visit(collide(graph.nodes[i]));  
      
    link.selectAll("line")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  }

    svg.on("mousemove", function() {
      var p1 = d3.mouse(this);
      graph.nodes.px = p1[0];
      graph.nodes.py = p1[1];
      force.resume();
    });
    
    force.start();   
});

  function collide(node) {
      var r = node.radius + 660,
          nx1 = node.x - r,
          nx2 = node.x + r,
          ny1 = node.y - r,
          ny2 = node.y + r;
      return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = node.radius + quad.point.radius ;
          if (l < r) {
            l = (l - r) / l * .5;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}

