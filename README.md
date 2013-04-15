Node.js Image Server
====================

Installation
------------

Clone the repository then:

    npm install

Run
---

    node server.js /path/to/directory/of/images
    
    http://localhost:3030/image.jpg

Certain operations on the requested image can be performed on demand using the following query parameters:

    h: height    - unsigned integer
    w: width     - usigned integer
    q: quality   - 0-to-100
    o: operation - resize|scale (default)

Default operation is `scale` which keeps the proportions of the image based on the given `w` or `h` parameters. If both `w` and `h` are provided then the smaller of the two is chosen. The `resize` operation changes the image to exactly the proportions specified by `w` and `h`.
