//! Default Compute@Edge template program.
import * as aws4 from "aws4";

const makeRequest = async (target, query) => {
  let startTime = new Date().getTime();

  let opts = {
    path: "/",
    service: "dynamodb",
    region: "eu-west-1",
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.0",
      "X-Amz-Target": `DynamoDB_20120810.${target}`,
    },
    body: JSON.stringify(query),
  };

  // aws4.sign() will sign and modify these options, ready to pass to http.request
  aws4.sign(opts, {
    accessKeyId: "TokenGoesHere",
    secretAccessKey: "TokenGoesHere",
  });

  let req = new Request(
      `https://${opts.service}.${opts.region}.amazonaws.com${opts.path}`,
      {
        headers: opts.headers,
        method: opts.method,
        body: opts.body,
      }
  );

  req.setCacheOverride(new CacheOverride("pass"));

  let f = await fetch(req, { backend: "aws_dynamodb" });

  console.log(`DynamoDb Request took: ${new Date().getTime() - startTime}ms`);

  return await f.json();
}

const getPlayers = async () => {
  let players = (await makeRequest("Scan", {
    TableName: "fastly-hack"
  })).Items;

  return players
}

const updatePlayer = async (url) => {

  // for (const [key, value] of url.searchParams) {
  //   console.log(JSON.stringify({key, value}))
  // }
  // console.log(url.searchParams.get("x"))
  //
  // console.log(JSON.stringify(url.s));
  let data = {
    x: {
      N: `${url.searchParams.get("x")}`,
    },
    y: {
      N: `${url.searchParams.get("y")}`,
    },
    direction: {
      N: `${url.searchParams.get("r")}`
    },
    page: {
      S: `${url.searchParams.get("page")}`
    },
    time: {
      N: `${Math.round((new Date()).getTime() / 1000)}`
    }
  };

  return await makeRequest("UpdateItem", {
    TableName: "fastly-hack",
    Key: {
      id: {
        S: `${url.searchParams.get("id")}`,
      },
    },
    ExpressionAttributeValues: {
      ":lastseen": { N: `${Math.round((new Date()).getTime() / 1000)}` },
      ":playerData": {
        M: data
      }
    },
    UpdateExpression: "SET lastseen = :lastseen, playerData = :playerData",
  });
}

// The entry point for your application.
//
// Use this fetch event listener to define your main request handling logic. It could be
// used to route based on the request properties (such as method or path), send
// the request to a backend, make completely new requests, and/or generate
// synthetic responses.

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));


async function handleRequest(event) {
  // Get the client request.
  let req = event.request;

  // set('key2', 'value').then(({ data }) => {
  //   console.log(data);
  //   // -> "OK"
  // });

  // Filter requests that have unexpected methods.
  if (!["HEAD", "GET"].includes(req.method)) {
    return new Response("This method is not allowed", {
      status: 405,
    });
  }
  let url = new URL(req.url);

  if (url.pathname.startsWith('/api')){
    if (url.pathname.startsWith('/api/get')){
      return new Response(JSON.stringify(await getPlayers()), {
        status: 200,
        headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
      });
    }
    if (url.pathname.startsWith('/api/set')){
      const resp = await updatePlayer(url)
      return new Response(JSON.stringify(resp), {
        status: 200,
        headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
      });
    }
    // if (url.pathname.startsWith('/api/delete')){
    //
    // }
    const data = req.url
    return
  }

  // If request is to the `/` path...
    // Below are some common patterns for Compute@Edge services using JavaScript.
    // Head to https://developer.fastly.com/learning/compute/javascript/ to discover more.

    // Create a new request.

  let path = url.pathname == "/" ? "/uk" : url.pathname;
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
      const myId = Math.round(Math.random() * 1000000);

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
      
      // dom
      let container2 = document.createElement( 'div' );
      container2.setAttribute("id","myCanvas2")
      document.body.appendChild( container2 );
      
      // renderer
      let renderer2 = new THREE.WebGLRenderer( { alpha: true } );
      renderer2.setSize( document.body.clientWidth, window.innerHeight );
      container2.appendChild( renderer2.domElement );
      
      // scene
      let scene2 = new THREE.Scene();
      

      // camera
      let d2 = window.innerWidth / window.innerHeight; // perhaps also should be clientWidth
      let camera2 = new THREE.OrthographicCamera( -10 * d2, 10 * d2, 10, -10, 1, 1000 );
      camera2.position.set( 20, 20, 0 ); // looking down the z-axis
      camera2.lookAt( scene2.position );
      
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
        renderer2.render(scene2, camera);
      }
      
      
      setInterval(() => {
        const selectedAnchor = findSelectedAnchor();
        if (selectedAnchor) {
          currentAnchor = selectedAnchor;
          selectedAnchor.focus();
        }
        const y = encodeURIComponent(mesh.position.x);
        const x = encodeURIComponent(mesh.position.z);
        const r = encodeURIComponent(mesh.rotation.y);
        const id = encodeURIComponent(myId);
        const page = encodeURIComponent("page");
        const otherCuboids = []
        
        fetch("https://largely-present-clam.edgecompute.app/api/set?x="+x+"&y="+y+"&r="+r+"&id="+id+"&page="+page);
        fetch("https://largely-present-clam.edgecompute.app/api/get")
            .then(response => response.json())
            .then(data => {
              for (let i = scene2.children.length - 1; i >= 0; i--) {
                  if(scene2.children[i].type === "Mesh"){
                      scene2.remove(scene2.children[i]);
                  }
              }
              data.map((player) => {
                  
                  // thisMesh.rotateY(player.playerData.M.direction.N;
                  if (player.id.S === myId.toString){ console.log('player name collision')}
                  if (player.playerData.M.x.N && player.playerData.M.y.N && player.id.S != myId){
                    let thisGeo = new THREE.BoxGeometry( 0.5, 1.5, 0.5 );
                    let thisMesh = new THREE.Mesh( thisGeo, material );
                    thisMesh.rotateY(player.playerData.M.direction.N)
                    thisMesh.position.set(player.playerData.M.y.N, 0, player.playerData.M.x.N);
                    scene2.add(thisMesh)
                  } else {console.log("failed")}
                }
              )
            })
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
        z-index: 1001;
    }
    #myCanvas2{
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
