# Park king

https://github.com/user-attachments/assets/5fb886b3-fadc-4408-9984-0868ac5d597e

app for checking live map of parking rules

currently only works for melbourne CBD

need google maps javascript API key

then create index.html file like this:

```html
<!DOCTYPE html>
<!--
 @license
 Copyright 2019 Google LLC. All Rights Reserved.
 SPDX-License-Identifier: Apache-2.0
-->
<html>
 <head>
  <title>Add Map</title>
  <style>
   #map {
    width: 800px;
    height: 800px;
    margin: auto;
   }
  </style>

  <link rel="stylesheet" type="text/css" href="./style.css" />
  <script type="module" src="./index.js"></script>
 </head>
 <body>
  <h3>My Google Maps Demo</h3>
  <!--The div element for the map -->
  <div id="map"></div>

  <!-- prettier-ignore -->
  <script>(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})
        ({key: YOUR_API_KEY, v: "weekly"});</script>

  <script src="map.js"></script>
 </body>
</html>




```

then do

```sh
npx serve .
```


