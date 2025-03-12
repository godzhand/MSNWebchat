<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js with GLTFLoader</title>
    <style>
        body, html { margin: 0; padding: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three/examples/js/renderers/CSS3DRenderer.js"></script>

<script>
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(79, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10); // Above and slightly angled
    camera.lookAt(0, 0, 0);

    // WebGL Renderer (for 3D model)
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // CSS3D Renderer (for HTML content)
    const cssRenderer = new THREE.CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
document.body.appendChild(cssRenderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // Load 3D Model
    const loader = new THREE.GLTFLoader();
    loader.load('msn.glb', (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        model.scale.set(0, 0, 0); // Scale model
    }, undefined, (error) => {
        console.error('Error loading model:', error);
    });

    // Create HTML Element
    const htmlElement = document.createElement('div');
    htmlElement.classList.add('html-content');
    htmlElement.innerHTML = `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Room List</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
            color: #333;
        }
        .category-dropdown {
            margin-bottom: 20px;
        }
        .category-dropdown select {
            padding: 8px;
            font-size: 16px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .room-list {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .room-list th, .room-list td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .room-list th {
            background-color: #f8f8f8;
        }
        .room-list tr {
            background-color: #e3e3d270; /* Pinkish tan */
        }
        .room-list tr:nth-child(even) {
            background-color: #feffed; /* Darker tan for even rows */
        }
        .room-list tr:hover {
            background-color: rgba(255, 255, 255, 0.9);
        }
        .pagination {
            text-align: center;
            margin-top: 20px;
        }
        .pagination a {
            margin: 0 5px;
            text-decoration: none;
            color: #333;
        }
        .pagination a:hover {
            color: #0078d7;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1></h1>
        <div class="category-dropdown">
            <label for="category">Select Category:</label>
            <select id="category" name="category">
                <option value="US Chats" selected>US Chats</option>
                <option value="Programming">Programming</option>
                <option value="Gaming">Gaming</option>
                <option value="General">General</option>
                <option value="AdultSwim">AdultSwim</option>
                <option value="Politics">Politics</option>
            </select>
        </div>
        <table class="room-list">
            <thead>
                <tr>
                    <th>Users</th>
                    <th>Room Name</th>
                    <th>Topic</th>
                    <th>Language</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>15</td>
                    <td>New2MSNTV</td>
                    <td>New to MSN TV</td>
                    <td>English</td>
                </tr>
                <tr>
                    <td>42</td>
                    <td>TheLobby</td>
                    <td>MSN Lobbies, Where the Fun</td>
                    <td>English</td>
                </tr>
                <tr>
                    <td>23</td>
                    <td>TheLobby1</td>
                    <td>Never Ends</td>
                    <td>English</td>
                </tr>
                <tr>
                    <td>37</td>
                    <td>TheLobby2</td>
                    <td>MSN Lobbies, Where the Fun</td>
                    <td>English</td>
                </tr>
                <tr>
                    <td>19</td>
                    <td>TheLobby3</td>
                    <td>Never Ends</td>
                    <td>English</td>
                </tr>
                <tr>
                    <td>56</td>
                    <td>TheLobby4</td>
                    <td>MSN Lobbies, Where the Fun</td>
                    <td>English</td>
                </tr>
                <tr>
                    <td>31</td>
                    <td>TheLobby5</td>
                    <td>Never Ends</td>
                    <td>English</td>
                </tr>
            </tbody>
        </table>
        <div class="pagination">
            <a href="#">1</a>
            <a href="#">2</a>
            <a href="#">Next</a>
        </div>
    </div>
</body>
</html>
    `;

    // Convert HTML to CSS3DObject
// Convert HTML to CSS3DObject
const cssObject = new THREE.CSS3DObject(htmlElement);
    cssObject.position.set(0, 0, -5); // Position in front of the model
    cssObject.scale.set(0.05, 0.05, 0.01); // Scale the HTML content
    scene.add(cssObject);
    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        cssRenderer.render(scene, camera);
    }
    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        cssRenderer.setSize(window.innerWidth, window.innerHeight);
    });

</script>

</body>
</html>
