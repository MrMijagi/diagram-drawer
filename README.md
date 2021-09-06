![npm (scoped)](https://img.shields.io/npm/v/@toothlessjs/diagram-drawer)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@toothlessjs/diagram-drawer)

Allows for creating diagrams from JSON files. Uses [paper.js](http://paperjs.org/).

# Install

```
$ npm install @toothlessjs/diagram-drawer
```

# Usage

To render a diagram create StructureDrawer object, initialize it with canvas that diagram will be drawn on. Next, call `init(dictionary)` to initialize elements and connections inside it. Then render them on canvas using `draw()`. You also need to import paper.js script under `paper` variable so that StructureDrawer can use it.

# Dictionary structure

Dictionary used in `init()` function must contain specific keys and their values:

* x_size - sets canvas width to this value
* y_size - sets canvas height to this value
* background_color - fills canvas with this color (string with #rgb notation i.e. "#00ff77"). If string is empty canvas won't be filled
* elements - dictionary that contains all points to be rendered. Each element inside dictionary is defined by another dictionary and the key functions as ID of the element
* connections - list of dictionaries that specify which points (elements) should be connected to each other

# Elements attributes

After `init()` is called, StructureDrawer takes all defined elements and calculates their attributes needed for paper.js to render them. Attributes can be divided into those that define element position and those that define its appearance.

## Appearance

The following attributes are used to specify appearance of the element:

* `shape` - string that can take three values: "rectangle" (default), "ellipse" and "text"

| `shape: rectangle` | `shape: ellipse` | `shape: text` |
|--------------------|------------------|---------------|
|![image (22)](https://user-images.githubusercontent.com/45121219/132241184-2f2f7a9e-4e4f-4920-a531-aa368b6b94e0.png) | ![image (23)](https://user-images.githubusercontent.com/45121219/132241208-1f0675f3-a042-461d-8f35-81444543e513.png) | ![image (24)](https://user-images.githubusercontent.com/45121219/132241232-a22da4f9-e373-4868-82c7-3f1db498e362.png) |

* `width` - number
* `height` - number

Note: `shape: text` will override `width` and `height` attributes to the size of font.

* `background_color` - string in #rgb notation. If empty, background is transparent (default)
* `border_width` - number (1 by default)
* `border_color` - string in #rgb notation. If empty, border is transparent (default)
* `text` - string, text to display in the center of element
* `text_color` - string in #rgb notation. If empty, text is transparent (default)
* `text_size` - number (10 by default)
* `copy` - ID of other element that appearance attributes should be copied into this one. Attributes are copied first, then those specified are overwritten

To explain `copy` attribute, let's create new element with following attributes:

```
"original": {
  "width": 65
  "height": 45
  "background_color": "#afc"
  "border_color": "#f4a"
  "border_width": 2
  "text": "42"
  "text_color": "#f4a"
  "text_size": 30
}
```

Now, we will create similar element with different text color:

```
"copy": {
  "copy": "original"
  "text_color": "#fc9403"
}
```

Results:

| Original | Copy |
|----------|------|
| ![image (25)](https://user-images.githubusercontent.com/45121219/132247260-f5eb3566-e52d-438c-8e96-c2bd0ceda4d5.png) | ![image (26)](https://user-images.githubusercontent.com/45121219/132247278-733d2e05-54c8-4120-a476-16d534f7ad66.png) |

## Positioning

The following attributes are used to specify element position:

* `x` - absolute x position on canvas (if position attribute is defined it acts more like an offset)
* `y` - absolute y position on canvas (if position attribute is defined it acts more like an offset)
* `position` - ID of other element. If element with specified ID exists, currently initialized element takes `x` and `y` values from it. If `x` and `y` attributes are also defined, they are added to copied position
* `align` - string with four possible values: `top`, `bottom`, `left` and `right`. If `position` attribute is defined, current element will be put next to element pointed by it

Some examples to better understand how positioning works:

|                  | Without `position` | With `position: orange` |
|------------------|--------------------|-------------------------|
| `x: 0`, `y: 0`   | ![image (14)](https://user-images.githubusercontent.com/45121219/132238121-a78323df-91e8-4ac7-86cd-646d11ec4da6.png) | ![image (15)](https://user-images.githubusercontent.com/45121219/132238182-be1b311a-d408-43f2-9f03-89f2537996e0.png) |
| `x: 20`, `y: 20` | ![image (17)](https://user-images.githubusercontent.com/45121219/132238256-1d8c5002-3288-482f-a0ab-ddd639bb4cc1.png) | ![image (16)](https://user-images.githubusercontent.com/45121219/132238221-74af340b-9b3a-4c3e-aed9-886c6f09c1a7.png) |

If `x` and `y` are equal to 0, element won't be rendered. This is useful when creating template elements (using `copy` attribute so you don't have to copy/paste attributes).

`align` attribute (with `position: orange`):

|                  | `align: top` | `align: right`  |
|------------------|--------------|-----------------|
| `x: 0`, `y: 0`   | ![image (18)](https://user-images.githubusercontent.com/45121219/132240273-74b8467f-5965-4a30-ae59-fda38f116932.png) | ![image (19)](https://user-images.githubusercontent.com/45121219/132240353-d6455431-e59b-4838-ba1b-bbff593be661.png) |
| `x: 20`, `y: 20` | ![image (20)](https://user-images.githubusercontent.com/45121219/132240440-5ba997d1-5bab-47b0-9be4-ad0e4fbac699.png) | ![image (21)](https://user-images.githubusercontent.com/45121219/132240491-249cfc62-7c93-461e-8359-027d4621c4e5.png) |

Note: Use `shape: text` and `align` attributes to concatenate texts with each other.

# Connections attributes

After StructureDrawer initializes all the elements, it goes to list of connections. Connections always connect centers of elements and end on their borders. Connection must have `from` and `to` attributes which consist of IDs of elements to be connected. Their appearance can be modified with following attributes:

* `margin` - positive number. Distance between border of the element and end of connection. 0 by default

| `margin: 0` | `margin: 10` |
|-------------|--------------|
| ![image (27)](https://user-images.githubusercontent.com/45121219/132249458-587d9f9f-88ef-4114-9393-abd11e4e9de5.png) | ![image (28)](https://user-images.githubusercontent.com/45121219/132249471-c6f5dc3c-7584-48a2-acd9-516fe7862530.png) |

* `text` - string - text that appears on connection
* `text_color` - string in #rgb notation. If empty text is transparent (default)
* `text_size` - number. 10 by default
* `text_offset` - number in range from 0 to 1. Defines text placement relative to the length of connection. 0.5 by default (center)

| `text_offset: 0.5` | `text_offset: 0.2` |
|--------------------|--------------------|
| ![image (29)](https://user-images.githubusercontent.com/45121219/132249949-658e617e-34b1-423e-ae3e-e00e1203fb9f.png) | ![image (30)](https://user-images.githubusercontent.com/45121219/132249965-9679a1a6-2825-455e-8703-38e26cb35fcc.png) |

* `text_height` - number, distance between text and direction (10 by default)

| `text_height: 0`   | `text_height: 20`  |
|--------------------|--------------------|
| ![image (31)](https://user-images.githubusercontent.com/45121219/132250016-54b70435-1e0e-4e05-a2f6-d71c321a7933.png) | ![image (32)](https://user-images.githubusercontent.com/45121219/132250042-6af852ac-939a-47b6-994b-9b5fa81be84c.png)

* `start_arrow` - true / false. If true, an arrow will be drawn at the start of connection (false be default)
* `end_arrow` - true / false. If true, an arrow will be drawn at the end of the connection (false by default)

|                     | `start_arrow: false` | `start_arrow: true`  |
|---------------------|----------------------|----------------------|
| `end_arrow: false`  | ![image (33)](https://user-images.githubusercontent.com/45121219/132250174-42487b22-e084-408b-b0c1-3d23b8e94d8b.png) | ![image (34)](https://user-images.githubusercontent.com/45121219/132250216-f121488e-7088-46c8-abf9-d31697bc783f.png) |
| `end_arrow: true`   | ![image (35)](https://user-images.githubusercontent.com/45121219/132250235-80df60bb-466c-4995-a95b-4bcda8cd297d.png) | ![image (36)](https://user-images.githubusercontent.com/45121219/132250250-902b67b3-a2d8-4a7d-ba6a-51531ae4b4f9.png) |

* `arrow_width` - number, defines the length of the back od the arrows (10 by default)
* `arrow_offset` - number, defines how long arrows are (10 by default)

|                     | `arrow_width: 10`   | `arrow_width: 20`     |
|---------------------|---------------------|-----------------------|
| `arrow_offset: 10`  | ![image (37)](https://user-images.githubusercontent.com/45121219/132250803-b79cd68f-9bd8-42d5-ad0b-b5f4ef5148b4.png) | ![image (38)](https://user-images.githubusercontent.com/45121219/132250815-4ef8d415-2026-44f4-b468-e5c86171c336.png) |
| `arrow_offset: 20`  | ![image (39)](https://user-images.githubusercontent.com/45121219/132250835-4137bab5-8603-4ea7-a73c-87b3613b1d33.png) | ![image (40)](https://user-images.githubusercontent.com/45121219/132250859-e2b44369-9f48-4153-abc7-bce7e37134c3.png) |

* `start_x_offset` - number, shifts the start of connection on x axis (0 by default)
* `start_y_offset` - number, shifts the start of connection on y axis (0 by default)
* `end_x_offset` - number, shifts the end of connection on x axis (0 by default)
* `end_y_offset` - number, shifts the end of connection on y axis (0 by default)

|                      | `start_x_offset: 0` | `start_x_offset: 20` |
|----------------------|---------------------|----------------------|
| `start_y_offset: 0`  | ![image (41)](https://user-images.githubusercontent.com/45121219/132250927-1d01813c-00df-486c-af20-e06f47dae15a.png) | ![image (42)](https://user-images.githubusercontent.com/45121219/132250942-bbae9652-5618-4c83-a80d-5755e7df12d9.png) |
| `start_y_offset: 20` | ![image (43)](https://user-images.githubusercontent.com/45121219/132250961-3b0e56ce-7867-480d-8592-69ae2c265241.png) | ![image (44)](https://user-images.githubusercontent.com/45121219/132250981-645b65cd-07e8-4108-988d-80faf50062e6.png) |

* `segments` - list of points (x and y) that connection has to go through
* `smoothing_factor` - number in range from 0 to 1. If segments exist, smoothens the curves. (0.2 by default)

Let's create two sets of segments:

```
[
  {
    "x": 20,
    "y": 80
  }
]
```

```
[
  {
    "x": 20,
    "y": 50
  },
  {
    "x": 80,
    "y": 50
  }
]
```

And combine them with different `smoothing_factor`s:

|                     | `smoothing_factor: 0` | `smoothing_factor: 0.5` |
|---------------------|-----------------------|-------------------------|
| first segments set  | ![image (47)](https://user-images.githubusercontent.com/45121219/132251347-74b8bdc0-f213-43dc-a3d5-e05d57028be2.png) | ![image (48)](https://user-images.githubusercontent.com/45121219/132251371-effa1027-9a3a-4e6a-adf0-218739b70773.png) |
| second segments set | ![image (45)](https://user-images.githubusercontent.com/45121219/132251291-b487f5f0-037d-4d8d-aa23-61dff37bc04c.png) | ![image (46)](https://user-images.githubusercontent.com/45121219/132251308-b5bfb9d4-8d75-4b5c-b22f-1368a775b851.png) |

# Known issues

Diagram won't render when two connected elements are overlapping.
