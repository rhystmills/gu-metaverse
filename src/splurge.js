//! Default Compute@Edge template program.
import welcomePage from "./welcome-to-compute@edge.html";

import { Router } from 'flight-path';
import { auth, incr, set, scan, get, keys } from '@upstash/redis';

// The entry point for your application.
//
// Use this fetch event listener to define your main request handling logic. It could be
// used to route based on the request properties (such as method or path), send
// the request to a backend, make completely new requests, and/or generate
// synthetic responses.

auth({
    url: 'https://eu1-capital-serval-34694.upstash.io',
    token:
        'TokenGoesHere',
    requestOptions: { backend: 'upstash-db' },
});

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
    // Get the client request.
    let req = event.request;

    set('key', 'value').then(({ data }) => {
        console.log(data);
        // -> "OK"
    });

    // Filter requests that have unexpected methods.
    if (!["HEAD", "GET"].includes(req.method)) {
        return new Response("This method is not allowed", {
            status: 405,
        });
    }

    let url = new URL(req.url);


    if (url.pathname.startsWith('/api')){
        if (url.pathname.startsWith('/api/get')){
            auth({
                url: 'https://eu1-capital-serval-34694.upstash.io',
                token:
                    'TokenGoesHere',
                requestOptions: { backend: 'upstash-db' },
            });

            let dbKeys = await keys('*')
            console.log(dbKeys)
            let rows = dbKeys.map(async (key) => await get(key))
            return new Response(rows, {
                status: 200,
                headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
            });
        }
        if (url.pathname.startsWith('/api/set')){
            await auth({
                url: 'https://eu1-capital-serval-34694.upstash.io',
                token:
                    'TokenGoesHere',
                requestOptions: { backend: 'upstash-db' },
            });

            set('key', 'value').then(({ data }) => {
                console.log(data);
                // -> "OK"
            }).catch(e => console.log(e));
        }
        // if (url.pathname.startsWith('/api/delete')){
        //
        // }
        const data = req.url
        return
    }

    let path = url.pathname == "/" ? "/uk" : url.pathname
    let bereq = new Request("https://www.theguardian.com" + path);

    // Add request headers.
    req.headers.set("X-Custom-Header", "Welcome to Compute@Edge!");
    req.headers.set(
        "X-Another-Custom-Header",
        "Recommended reading: https://developer.fastly.com/learning/compute"
    );

    // Create a cache override.
    // let cacheOverride = new CacheOverride("override", { ttl: 60 });

    // Forward the request to a backend.
    let gu = await fetch(bereq, {
        backend: "guardian",
    })
        .then(response => response.text())

    gu = gu.replaceAll('href="https://www.theguardian.com','href="')
    const bodyEnd = gu.indexOf("</body>");
    const script = `
    <script src=\"https://threejs.org/build/three.min.js\"></script>
    <script>
      // Work-around to render a Top-Down Oblique Projection
      // Use an orthographic camera, and apply a shear matrix to the geometry before rendering

      // dom
      let container = document.createElement( 'div' );
      container.setAttribute("id","myCanvas")
      document.body.appendChild( container );

      // renderer
      let renderer = new THREE.WebGLRenderer( { alpha: true } );
      renderer.setSize( document.body.clientWidth, window.innerHeight );
      container.appendChild( renderer.domElement );

      // scene
      let scene = new THREE.Scene();

      // Current link hovered above
      let currentAnchor = null;

      // camera
      let d = window.innerWidth / window.innerHeight; // perhaps also should be clientWidth
      let camera = new THREE.OrthographicCamera( -10 * d, 10 * d, 10, -10, 1, 1000 );
      camera.position.set( 20, 20, 0 ); // looking down the z-axis
      camera.lookAt( scene.position );

      // material
      let material = new THREE.MeshNormalMaterial( { overdraw: 0.5 } );

      // geometry
      let geometry = new THREE.BoxGeometry( 0.5, 1.5, 0.5 );

      let mesh = new THREE.Mesh( geometry, material ); // centered at the origin
      mesh.rotateY(Math.PI);

      scene.add( mesh );

      window.addEventListener("keydown", (e) => {
          if(e.code === 'ArrowLeft') {
            mesh.rotateY(Math.PI/16);
            e.preventDefault();
          }
          if(e.code === 'ArrowUp') {
            e.preventDefault();
            mesh.translateX(0.2);
          }
          if(e.code === 'ArrowDown') {
            e.preventDefault();
          }
          if(e.code === 'ArrowRight') {
            e.preventDefault();
            mesh.rotateY(-Math.PI/16);
          }
          if(e.code === 'Enter') {
            if (currentAnchor) {
                currentAnchor.click();
            }
            // console.log(mesh.position)
            // console.log({
            //     zPos: mesh.position.z * -48.284,
            //     halfClientWidth: document.body.clientWidth/2,
            //     xPos: mesh.position.x * 36.92,
            //     halfWindowHeight: window.innerHeight / 2
            // })
          }
      })

      const getAllAnchors = () => {
         const anchors = document.querySelectorAll("a")
         return [...anchors]
      }
      const anchors = getAllAnchors();

      const findSelectedAnchor = () => {
          let found = false;
          let i = 0;
          let x = (mesh.position.z * -48.284) + document.body.clientWidth/2;
          let y = (mesh.position.x * 36.92 + window.innerHeight/2);
          // console.log(x);
          // console.log(y);
          while (!found && i < anchors.length){
              let rect = anchors[i].getBoundingClientRect();
              if (x < rect.right && x > rect.left && y > rect.top && y < rect.bottom){
                  found = anchors[i]
              }
              i++;
          }
          return found
      }

      // render
      function animate() {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
      }


      setInterval(() => {
        const selectedAnchor = findSelectedAnchor();
        if (selectedAnchor) {
          currentAnchor = selectedAnchor;
          selectedAnchor.focus();
        }
      }, 500)

      animate();
    </script>
    <style>
    * {
        /*font-family: 'Comic Sans MS' !important;*/
    }
    #sp_message_container_597005{
        display: none !important;
    }
    .top-banner-ad-container{
        display: none !important;
    }
    #myCanvas{
        position: fixed;
        top: 0px;
        z-index: 1000;
    }
    a:focus {
        outline: 5px solid #f5b342 !important;
        z-index: 999 !important;
        opacity: 1 !important;
    }
    </style>
  `;
    const newGu = [gu.slice(0, bodyEnd), script, gu.slice(bodyEnd)].join('');

    // Remove response headers.
    // beresp.headers.delete("X-Another-Custom-Header");

    // Log to a Fastly endpoint.
    // const logger = fastly.getLogger("my_endpoint");
    // logger.log("Hello from the edge!");

    // Send a default synthetic response.
    // let copy = "";
    // const para = (string) => `<p>${string}</p>`;

    // try {
    //   fetch('https://www.theguardian.com/uk')
    //     .then(response => response.json())
    //     .then(data => console.log(data));
    //   // copy = copy.concat(para(`city: ${event.client.geo.city}`))
    // } catch(e){ console.log(e)}

    // try {
    //   console.log(event.client.geo);
    //   copy = copy.concat(para(`address: ${event.client.address}`))
    // } catch(e){ console.log(e)}

    return new Response(newGu, {
        status: 200,
        headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
    });

    // Catch all other requests and return a 404.
    // return new Response("The page you requested could not be found", {
    //   status: 404,
    // });
}
