const openPopupBtn = document.querySelector('#openPopupBtn');
const exitPopupBtn = document.querySelector(".pop-up .exit");

const popup = document.querySelector('.pop-up');

// Dùng chung
const back = document.querySelectorAll('.back');

// Interface 1
const interface1 = document.querySelector('.interface-1');

const cameraBtn = document.querySelector('.interface-1 .camera');
const upload = document.querySelector('.interface-1 #upload');

// Interface 2
const interface2 = document.querySelector('.interface-2');

const displayCamera = document.querySelector('.interface-2 .display-camera video');
const captureBtn = document.querySelector('.interface-2 .capture button');

// Interface 3
const interface3 = document.querySelector('.interface-3');
const downloadBtn = document.querySelector('.interface-3 .downloadBtn');

const frames = document.querySelectorAll('.interface-3 .frame');
const captureAgainBtn = document.querySelector('.interface-3 .capture-again');
const canvas = document.querySelector('.interface-3 .main-image canvas');

const ctx = canvas.getContext("2d");

var mainImage;
var stream;
var previousPage = [];
var previousFrame = document.querySelector('.interface-3 #frameNone');

// Handle Open and Close
openPopupBtn.onclick = (e) => {
    e.preventDefault();
    openPopupBtn.classList.add('hidden');
    popup.classList.remove('hidden');
}

exitPopupBtn.onclick = (e) => {
    e.preventDefault();
    openPopupBtn.classList.remove('hidden');
    popup.classList.add('hidden');
    disableCamera();

    interface1.classList.remove('hidden');
    interface2.classList.add('hidden');
    interface3.classList.add('hidden');
}

// Handle In Interface 1
cameraBtn.onclick = () => {
    interface1.classList.add('hidden');
    interface2.classList.remove('hidden');
    previousPage.push(interface1);
    getCamera();
}

upload.onchange = (e) => {
    const img = e.target.files[0];
    if(img) {
        const dataImg = URL.createObjectURL(img);
        interface1.classList.add('hidden');
        interface3.classList.remove('hidden');

        previousPage.push(interface1);

        mainImage = dataImg;
        createImage(mainImage, null);
    }
}

// Handle In Interface 2
captureBtn.onclick = () => {
    const canvas = document.createElement('canvas');
    console.log(displayCamera.videoWidth);
    console.log(displayCamera.videoHeight);
    canvas.width = displayCamera.videoWidth;
    canvas.height = displayCamera.videoHeight;
    canvas.getContext('2d').drawImage(displayCamera, 0, 0, canvas.width, canvas.height);

    const dataImg = canvas.toDataURL();
    canvas.remove();

    interface2.classList.add('hidden');
    interface3.classList.remove('hidden');
    previousPage.push(interface2);

    mainImage = dataImg;
    createImage(mainImage, null);
    disableCamera();
}

// Handle In Interface 3
const createImage = (i, f) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(i){
        const img = new Image;
        // img.crossOrigin="anonymous";
        img.src = i;
    
        img.onload = () => {
            img.setAttribute('crossorigin', 'anonymous');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Phải đưa vào trong onload của img để đảm bảo khung phải được vẽ sau khi đã vẽ ảnh
            if(f){
                const frame = new Image;
                frame.src = f;
                
                frame.onload = () => {
                    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
                }
            }
        }
    }
}

// Download
downloadBtn.onclick = (e) => {
    download(canvas.toDataURL());
}

captureAgainBtn.onclick = () => {
    interface2.classList.remove('hidden');
    interface3.classList.add('hidden');
    getCamera();

    // Cái này là back lại page 2. Nên nếu page 2 đã có trong previous Page thì ta cần xoá nó đi
    if(previousPage[previousPage.length - 1].classList.contains('interface-2')) {
        previousPage.pop();
    }
}

// Handle when user click to picture frame
frames.forEach(one => {
    one.onclick = (e) => {
        e.preventDefault();
        e.target.classList.add('selected');
        if(previousFrame){
            previousFrame.classList.remove('selected');
            previousFrame = e.target;
        }
        if(one.id === 'frameNone') createImage(mainImage);
        else {
            createImage(mainImage, one.querySelector('img').getAttribute('src'));
        }
    }
});

// Handle Download
var download = (url) => {
    var link = document.createElement('a');
    link.download = 'Unknown.png';
    link.href = url;
    link.click();
  }

// Handle getCamera
var getCamera = () => {
    navigator.mediaDevices.getUserMedia({ 
        audio: false, 
        video: { facingMode: "user", width: { ideal: 360 }, height: { ideal: 640 } }
    })
    .then(streamObject => {
        displayCamera.srcObject = streamObject;
        stream = streamObject;
    })
    .catch(err => console.error(err));
}

// Handle disableCamera
var disableCamera = () => {
    if(stream){
        const vidTrack = stream.getVideoTracks();
        vidTrack.forEach(track => track.stop());
    }
}

// Handle back
back.forEach(one => {
    one.onclick = (e) => {
        e.preventDefault();
        console.log(previousPage);
        const interface = e.target.parentNode.parentNode;
        interface.classList.add('hidden');
        // Nếu như từ interface camera, back về interface 1 thì disable camera đi
        if(interface.classList.contains('interface-2')) {
            disableCamera();
        }

        // Nếu như từ interface khác back về interface 2 thì get camera
        if(previousPage){
            const interfaceDesc = previousPage.pop();
            if(interfaceDesc.classList.contains('interface-2')) getCamera();
            interfaceDesc.classList.remove('hidden');
        }
    }
})