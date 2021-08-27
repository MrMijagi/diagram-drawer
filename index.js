const connection_keys = [
  "path_color",
  "path_width",
  "start_arrow",
  "start_x_offset",
  "start_y_offset",
  "end_arrow",
  "end_x_offset",
  "end_y_offset",
  "margin",
  "arrow_offset",
  "arrow_width",
  "smoothing_factor",
  "text_offset",
  "text_height"
];

const shape_keys = [
  "shape",
  "width",
  "height",
  "border_color",
  "background_color",
  "border_width"
];

const text_keys = [
  "text",
  "text_color",
  "text_size"
];

function draw_arrow(path, segment_index, offset, width, color) {
  let offset_point = path.getPointAt(offset);
  let normal = path.getNormalAt(offset);
  let point_left = normal.multiply(width / 2);
  let point_right = normal.multiply(-width / 2);

  let arrow = new paper.Path({
    segments: [path.segments[segment_index], point_left.add(offset_point), point_right.add(offset_point)],
    closed: true,
    fillColor: color,
    strokeColor: color
  });

  path.segments[segment_index].point = offset_point;

  return arrow;
}

class Connection {
  constructor(dict) {
    this.dict = dict;
    this.initialized = false;
    this.from = null;
    this.to = null;
    this.segments = [];

    // connection attributes
    this.path_color = "#000";
    this.path_width = 2;
    this.start_arrow = false;
    this.start_x_offset = 0;
    this.start_y_offset = 0;
    this.end_arrow = false;
    this.end_x_offset = 0;
    this.end_y_offset = 0;
    this.margin = 0;
    this.arrow_offset = 10;
    this.arrow_width = 10;
    this.smoothing_factor = 0.2;
    this.text_offset = 0.5;
    this.text_height = 10;

    // text attributes
    this.text = "";
    this.text_color = "#000";
    this.text_size = 20;

    // paper js items
    this.path = null;
    this.text_path = null;
    this.start_arrow_path = null;
    this.end_arrow_path = null;
  }

  init(elements) {
    // find start and end elements
    if (!("from" in this.dict)) {
      console.log("'from' not defined");
    } else {
      if (!(this.dict["from"] in elements)) {
        console.log("element pointed by 'from' key does not exist");
      } else {
        this.from = elements[this.dict["from"]];
      }
    }

    if (!("to" in this.dict)) {
      console.log("'to' not defined");
    } else {
      if (!(this.dict["to"] in elements)) {
        console.log("element pointed by 'to' key does not exist");
      } else {
        this.to = elements[this.dict["to"]];
      }
    }

    // load the segments into array
    if ("segments" in this.dict) {
      for (let segment of this.dict["segments"]) {
        this.segments.push(new paper.Point(segment["x"], segment["y"]));
      }
    }

    // save the rest of attributes
    for (let connection_key of connection_keys) {
      if (connection_key in this.dict) {
        this[connection_key] = this.dict[connection_key];
      }
    }

    for (let text_key of text_keys) {
      if (text_key in this.dict) {
        this[text_key] = this.dict[text_key];
      }
    }

    // initialization is over, update the variable
    this.initialized = true;
  }

  draw() {
    // create connection path
    this.path = new paper.Path({
      segments: [this.from.path.position, this.to.path.position],
      strokeColor: this.path_color != "" ? this.path_color : null,
      strokeWidth: this.path_width
    });

    // insert segments that path should go through
    this.path.insertSegments(1, this.segments);

    // smooth the path using smoothing_factor
    this.path.smooth({ type: 'geometric', factor: this.smoothing_factor});

    // set start and end of the paths to border of the elements (not centers)
    let intersections = this.path.getIntersections(this.from.path);
    if (intersections.length > 0) this.path.segments[0].point = intersections[0].point;
    intersections = this.path.getIntersections(this.to.path);
    if (intersections.length > 0) this.path.segments[this.path.segments.length - 1].point = intersections[0].point;

    // create a margin between border of the element and path ending
    let offset_point = this.path.getPointAt(this.margin);
    this.path.segments[0].point = offset_point;

    offset_point = this.path.getPointAt(this.path.length  - this.margin);
    this.path.segments[this.path.segments.length - 1].point = offset_point;

    // add offsets to start and end
    this.path.segments[0].point = this.path.segments[0].point.add(new paper.Point(this.start_x_offset, this.start_y_offset));
    this.path.segments[this.path.segments.length - 1].point = this.path.segments[this.path.segments.length - 1].point.add(new paper.Point(this.end_x_offset, this.end_y_offset));

    // draw arrows on ends
    if (this.end_arrow) {
      this.end_arrow_path = draw_arrow(this.path, this.path.segments.length - 1, this.path.length - this.arrow_offset, this.arrow_width, this.path_color != "" ? this.path_color : null);
    }

    if (this.start_arrow) {
      this.start_arrow_path = draw_arrow(this.path, 0, this.arrow_offset, this.arrow_width, this.path_color != "" ? this.path_color : null);
    }

    // set text
    this.text_path = new paper.PointText({
      content: this.text,
      fillColor: this.text_color != "" ? this.text_color : null,
      fontFamily: 'Courier New',
      fontWeight: 'bold',
      fontSize: this.text_size,
      justification: 'center'
    });

    // set text somewhere along the path (depending on both offset and height)
    let offset = this.path.length * this.text_offset;
    this.text_path.position = this.path.getPointAt(offset).add(this.path.getNormalAt(offset).multiply(this.text_height));
  }
}

// takes two elements and copies the paper attributes for drawing
function copy_attributes(from, to) {
  for (let shape_key of shape_keys) {
    to[shape_key] = from[shape_key];
  }

  for (let text_key of text_keys) {
    to[text_key] = from[text_key];
  }
}

function check_if_initialized(elements, name) {
	if (!elements[name].initialized) {
		console.log("initializing", name);
		elements[name].init(elements);
	}
}

class Element {
  constructor(dict) {
    this.dict = dict;
    this.initialized = false;
    this.x_pos = 0;
    this.y_pos = 0;

    // shape attributes
    this.shape = "rectangle";
    this.width = 0;
    this.height = 0;
    this.border_color = null;
    this.background_color = null;
    this.border_width = 1.;

    // text attributes
    this.text = "";
    this.text_color = null;
    this.text_size = 10;

    // paper js items
    this.path = null;
    this.text_path = null;
  }

  init(elements) {
    // save the rest of attributes
    for (let shape_key of shape_keys) {
      if (shape_key in this.dict) {
        this[shape_key] = this.dict[shape_key];
      }
    }

    for (let text_key of text_keys) {
      if (text_key in this.dict) {
        this[text_key] = this.dict[text_key];
      }
    }

    // if shape "text", update width and height to text bounds
    if (this.shape == "text") {
      this.width = this.text_size * this.text.length * 0.6; // 0.6 is specific to 'Courier New' font (its important that this is monospaced font)
      this.height = this.text_size * 1.2;
    }

    let copy = null;

    // check if appearance attributes should be copied
    if ("copy" in this.dict) {
      copy = this.dict["copy"];

      if (!(copy in elements)) {
        console.log("   this 'copy' doesn't exist");
      } else {
        // init element if it wasn't initialized yet
        check_if_initialized(elements, copy);
        copy_attributes(elements[copy], this);
      }
    }

    let position = null;

    // check if position should be copied
    if ("position" in this.dict) {
      position = this.dict["position"];

      // check if position is pointing to existing key
      if (!(position in elements)) {
        console.log("   this 'position' doesn't exist");
      } else {
        // init element if it wasn't initialized yet
        check_if_initialized(elements, copy);
      }
    }

    // calculate position depending if 'position' attribute was defined
    if (!position) {
      // absolute position - both x and y are required
      if (!("x" in this.dict && "y" in this.dict)) {
        console.log("   X or Y not defined");
      } else {
        this.x_pos = this.dict["x"];
        this.y_pos = this.dict["y"];
      }
    } else {
      // relative position - check if x or y are defined
      this.x_pos = elements[position].x_pos + (this.dict["x"] ? this.dict["x"] : 0);
      this.y_pos = elements[position].y_pos + (this.dict["y"] ? this.dict["y"] : 0);

      // check if align attributes exists
      if ("align" in this.dict) {
        switch (this.dict["align"]) {
          case "top":
            console.log(elements[position].height);
            this.y_pos -= (elements[position].height / 2) + (this.height / 2);
            break;
          case "bottom":
            this.y_pos += (elements[position].height / 2) + (this.height / 2);
            break;
          case "left":
            this.x_pos -= (elements[position].width / 2) + (this.width / 2);
            break;
          case "right":
            this.x_pos += (elements[position].width / 2) + (this.width / 2);
            break;
        }
      }
    }

    // initialization is over, update the variable
    this.initialized = true;
  }

  draw() {
    if (this.x_pos != 0 || this.y_pos != 0) {
      if (this.shape == "ellipse") {
        this.path = new paper.Path.Ellipse({
          position: new paper.Point([this.x_pos, this.y_pos]),
          size: [this.width, this.height]
        });
      } else {
        this.path = new paper.Path.Rectangle({
          position: new paper.Point([this.x_pos, this.y_pos]),
          size: [this.width, this.height]
        });
      }

      // set shape attributes
      this.path.strokeColor = this.border_color != "" ? this.border_color : null;
      this.path.fillColor = this.background_color != "" ? this.background_color : null;
      this.path.strokeWidth = this.border_width;

      // set text
      this.text_path = new paper.PointText({
        content: this.text,
        fillColor: this.text_color != "" ? this.text_color : null,
        fontFamily: 'Courier New',
        fontWeight: 'bold',
        fontSize: this.text_size,
        justification: 'center'
      });

      // set text position to center of shape
      this.text_path.position = this.path.position;
    }
  }
}

class StructureDrawer {
  constructor(canvas) {
    this.canvas = canvas;
    paper.setup(canvas);
  }

  init(dict) {
    console.log("Initializing StructureDrawer");

    const attributes = [
      "background",
      "x_size",
      "y_size"
    ];

    for (let attribute of attributes) {
      if (!(attribute in dict)) {
        console.log("   " + attribute + " not defined");
      } else {
        this[attribute] = dict[attribute];
      }
    }

    this.elements = {};

    // create new elements from dict
    if ("elements" in dict) {
      for (let key in dict["elements"]) {
        this.elements[key] = new Element(dict["elements"][key]);
      }
    } else {
      console.log("   no elements found");
    }

    this.connections = [];

    // create new connections from dict
    if ("connections" in dict) {
      for (let connection of dict["connections"]) {
        this.connections.push(new Connection(connection));
      }
    } else {
      console.log("   no connections found");
    }

    // initialize all elements
    for (let element_key in this.elements) {
      if (!this.elements[element_key].initialized) {
        console.log("initializing", element_key);
        this.elements[element_key].init(this.elements);
      }
    }

    // initialize all connections
    for (let connection of this.connections) {
      if (!connection.initialized) connection.init(this.elements);
    }

    // set canvas size
    this.canvas.width = this.x_size;
    this.canvas.height = this.y_size;
  }

  draw() {
    if (!this.elements) {
      console.log("init() wasn't called");
    }

    // remove active elements
    paper.project.activeLayer.removeChildren();

    // draw background
    new paper.Path.Rectangle({
      point: [0, 0],
      size: [this.x_size, this.y_size],
      fillColor: this.background ? this.background : null
    });

    // draw elements
    for (let element_key in this.elements) {
      this.elements[element_key].draw();
    }

    // draw connections
    for (let connection of this.connections) {
      connection.draw();
    }

    paper.view.draw();
  }
}

export default StructureDrawer;
