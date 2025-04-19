# SPIFF - Simple Protoype Implementation For Flowcharts

[Shut up and let me demo it already](https://alexn-cyber.github.io/spiff/)

A vibe-coded garbage throaway code toy tool I wrote to scratch the itch of wanting to create manual layout SVG diagrams as code.

Because nobody, not even Pichkr, would give me that.

This does what I want and I'm sharing it for other game masters to use for preparing node graphs and relationship graphs with simple manual layouts.

## Examples

1. [A location crawl node graph](https://alexn-cyber.github.io/spiff/?dsl=U2FwcGVyIENhbXAgLT4gTkUgLT4gRm9nIEZvcmVzdApTYXBwZXIgQ2FtcCAtPiBOIC0-IEFiYW5kb25lZCBGYXJtIFthcnJvdz1ib3RoXQpBYmFuZG9uZWQgRmFybSAtPiBOIC0-IExha2UKTGFrZSAtPiBOIC0-IERla3Vtb2RvIFZpbGxhZ2UgW2Fycm93PWJvdGhdCkZvZyBGb3Jlc3QgLT4gTiAtPiBHaWFudCBTcGlkZXIgQ2xpZmZzIFthcnJvdz1ib3RoXQpHaWFudCBTcGlkZXIgQ2xpZmZzIC0-IE4gLT4gUmFkaWFuY2UgUHJpb3J5IFthcnJvdz1ib3RoXQpTYXBwZXIgQ2FtcCAtPiBOVyAtPiBCb2dzd2FtcCBbYXJyb3c9Ym90aF0KQm9nc3dhbXAgLT4gTiAtPiBBY2lkaWMgSGlyb2tpIEhvbGxvdyBbYXJyb3c9Ym90aF0KQWNpZGljIEhpcm9raSBIb2xsb3cgLT4gTiAtPiBHTExTRUMgW2Fycm93PWJvdGhdCkFiYW5kb25lZCBGYXJtIC0-IFcgLT4gQm9nc3dhbXAKRm9nIEZvcmVzdCAtPiBXIC0-IEFiYW5kb25lZCBGYXJtCkFjaWRpYyBIaXJva2kgSG9sbG93IC0-IFNFIC0-IEFiYW5kb25lZCBGYXJtCkRla3Vtb2RvIFZpbGxhZ2UgLT4gU0UgLT4gR2lhbnQgU3BpZGVyIENsaWZmcwpMYWtlIC0-IE5XIC0-IEdMTFNFQwpHTExTRUMgLT4gRSAtPiBEZWt1bW9kbyBWaWxsYWdlIFthcnJvdz1ib3RoXQpCb2dzd2FtcCAtPiBFIC0-IEZvZyBGb3Jlc3QgW2N1cnZlPXVwIGFycm93PWJvdGhd)
1. [Extremely partial world map](https://alexn-cyber.github.io/spiff/?dsl=VVMgLT4gTiAtPiBDYW5hZGEKQ2FuYWRhIC0tPiBXIC0-IFJ1c3NpYQpSdXNzaWEgLT4gU0UgLT4gSmFwYW4KSmFwYW4gLT4gVyAtPiBTb3V0aCBLb3JlYQpTb3V0aCBLb3JlYSAtPiBXIC0-IENoaW5hCkNoaW5hIC0-IFNXIC0-IEluZGlhCkNoaW5hIC0-IE4gLT4gUnVzc2lhCkluZGlhIC0-IFNFIC0-IEF1c3RyYWxpYQpBdXN0cmFsaWEgLT4gU0UgLT4gTmV3IFplYWxhbmQKTmV3IFplYWxhbmQgLT4gTiAtPiBWYW51YXR1ClZhbnVhdHUgLT4gRSAtPiBGaWppCkZpamkgLS0-IE5FIC0-IFVTCg)
1. [NPC relationship chart](https://alexn-cyber.github.io/spiff/?dsl=TWFydmluIC0-IE4gLT4gRG91ZwpEb3VnIC0-IE4gLT4gVmFsZXJpYQpWYWxlcmlhIC0-IEUgLT4gTG9yZCBIZWN0b3IgW2Fycm93PWJvdGhdCkxvcmQgSGVjdG9yIC0-IEUgLT4gTXIgU3BpZmYgW2Fycm93PWJvdGhdClZhbGVyaWEgLS0-IFcgLT4gSGFycnVuIFthcnJvdz1ib3RoXQpIYXJydW4gLS0-IFNXIC0-IEJlcnRoYQpIYXJydW4gLS0-IFMgLT4gU2Fsb21lCkhhcnJ1biAtPiBTRSAtPiBUYW5rYXJkCg) - admittedly this is why I will want to be able to label these arrows later on

## How to use?

### Basics

You add nodes and edges to a diagram using the following format into the textbox.

```spiff
A -> E -> B
```
![AEB-example](image.png)

Where `A` is a string representing a node, `E` is a compass cardinal direction (N, S, E, W, NE, NW, SE, SW), and `B` is a string representing a different node.

Then you click the Render Graph button or press Ctrl + Enter to render the diagram.

Each line is parsed at once, you can have multiple lines in the graph at the same time.

The diagram is base64-encoded so you can bookmark some pages, and there is a handy Download SVG button to save it locally for later use.

Last of all, the viewport can be clicked and dragged around in javascript.


### Line length controls

You can increase the spacing of the nodes on a per-line basis by adding additional hyphens in front of the first arrow.

```spiff
UK -> E -> English Channel
UK --> W -> USA
```

![UK-EW-USA-example](image-1.png)

### Line attributes

You can modify the lines between the nodes by adding one or more attributes inside square brackets.

By default, arrows have one point at the end of the line, but you can mess with it by including arrow directions. Turning off the arrow at the end of the line (via `arrow=start` or `arrow=none`) currently leaves a gap, I should bugfix that someday but for my usecase I don't care so um. Yeah.

```spiff
UK -> E -> English Channel [arrow=both]
UK --> W -> USA [arrow=start]
UK -> NW -> Ireland [arrow=none]
```

![dont-tell-anybody-but-im-committing-binary-blobs](image-2.png)

### Line curvature

If one line crosses a node and obscures its node text, you can add a `curve=up` or `curve=down` attribute to its line to help it get out of the way somewhat.

#### Before

```spiff
UK -> E -> English Channel [arrow=both]
UK --> W -> USA [arrow=start]
UK -> NW -> Ireland [arrow=none]
USA -> E -> English Channel
```

![before](image-3.png)

#### After

```spiff
UK -> E -> English Channel [arrow=both]
UK --> W -> USA [arrow=start]
UK -> NW -> Ireland [arrow=none curve=up]
USA -> E -> English Channel [curve=down]
```

![after](image-4.png)

Note that in the above example, the combination of attributes can be accomplished by space-separating the arguments within the same square brackets, see the Ireland line.

## Tech Minutae

Not that it matters to most, but the source text for the graph is embedded into the svg file for who knows what use down the road.

Browser compatibility wise, this does not support IE anything but it was tested on Firefox on Windows so there you go. Chrome and Webkit peeps should probably still be happy?

## Roadmap?

This already covers 80% of what I wanted, but I could see myself eventually having the itch to add the following features on my own time.

1. being able to label the arrows
1. being able to customize the start and endpoints on each shape for the arrow. So you could go something like 'the southeast corner of node A running northwest towards the north corner of node B', sounds complicated, probably not worth it.
1. Colors?
1. CSS?? now we are getting fancy
1. A legend thing where the nodes and the arrows are printed with just an identifier string and off to the side the string key and value are there for reading this diagram
1. drag-drop window can be auto-sized to be a landscape letter or other defined page size
1. multi-line text labels?
1. fix that bug where lines end before they touch the node
1. for curved lines, fix the arrowhead not being straight on to the line it is intersecting
1. PNG export?
1. overall diagram label titles
1. support a syntactic sugar like `A <-> N -> B` or `A <-N-> B` instead of needing to do `A -> N -> B [arrow=both]`
1. Any error messages / syntax checking feedback at all besides just wonky or dead graphs with console warnings
1. being able to have non-circle shapes

## Local development

Developed using vscode over remote ssh to a debian 12 VM.

### Local rendering tesing Use VSCode Remote Port Forwarding (Built-in)**

1. In VSCode, open the Command Palette (`Ctrl+Shift+P`).
2. Run: `Forward a Port`
3. Enter a local port (e.g., `5500`)
4. VSCode will give you a URL like `http://127.0.0.1:5500`
5. On the remote terminal (in VSCode), start a static file server in your project folder:
```bash
python3 -m http.server 5500
```
6. In your local browser, go to `http://127.0.0.1:5500/index.html`