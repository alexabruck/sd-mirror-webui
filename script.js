// SETTINGS
const DEFAULT_PROMPT_ADDITION = "pixar, disney character";
const WIDTH = 400;
const HEIGHT = 300;
const localStreamConstraints = {
  audio: false,
  video: { width: WIDTH, height: HEIGHT },
};
let canvasInterval = null;
const FPS = 4;

//DOM
const videoElement = document.getElementById("video-element");
const canvasElement = document.getElementById("canvas-element");
const submitButton = document.getElementById("submit-button");
const resultImg = document.getElementById("result-img");
const inputImg = document.getElementById("input-snapshot");
const inputImageCaption = document.getElementById("input-img-caption");
const resultImgCaption = document.getElementById("result-img-caption");
const inputApiUrl = document.getElementById("input-apiurl");
const inputPromptAddition = document.getElementById("input-prompt-addition");
const inputUseInterrogate = document.getElementById("input-useinterrogate");
inputPromptAddition.placeholder = DEFAULT_PROMPT_ADDITION;
inputImg.width = WIDTH;
inputImg.height = HEIGHT;
resultImg.width = WIDTH;
resultImg.height = HEIGHT;

// STATE
const userInput = {
  publicGradioUrl: "",
  promptAddition: DEFAULT_PROMPT_ADDITION,
  snapshot: "",
};

const ctx = canvasElement.getContext("2d", { alpha: false });
canvasElement.width = WIDTH;
canvasElement.height = HEIGHT;

function isValidApiUrl(url) {
  if (!url) return false;
  return url.endsWith(".gradio.live");
}

function removeArtistName(text) {
  const textArr = text.split(",");
  textArr.splice(-1); //remove last element after comma
  return textArr.join(",");
}

if (videoElement) {
  navigator.mediaDevices
    .getUserMedia(localStreamConstraints)
    .then(gotStream)
    .catch(function (e) {
      if (
        confirm(
          "An error with camera occured:(" + e.name + ") Do you want to reload?"
        )
      ) {
        location.reload();
      }
    });
} else {
  alert("No video element");
}

function gotStream(stream) {
  videoElement.srcObject = stream;
}

function drawImage(video) {
  ctx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
}

canvasInterval = window.setInterval(() => {
  drawImage(videoElement);
}, 1000 / FPS);

submitButton?.addEventListener("click", () => {
  collectUserInput();
  inputImg.src = userInput.snapshot;
  submit();
});

function interrogateClip(base64Image) {
  const bodyContent = {
    fn_index: 98,
    data: [base64Image],
    session_hash: "9jhj0ef5oqr",
  };

  return fetch(`${userInput.publicGradioUrl}/run/predict/`, {
    credentials: "omit",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:108.0) Gecko/20100101 Firefox/108.0",
      Accept: "*/*",
      "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
      "Content-Type": "application/json",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
    },
    referrer: "https://2b62f40e-4b82-4401.gradio.live/",
    body: JSON.stringify(bodyContent),
    method: "POST",
    mode: "cors",
  });
}

function requestimg2img(cameraImageAsBase64, thePrompt) {
  const bodyContent = {
    fn_index: 97,
    data: [
      0,
      thePrompt,
      "",
      "None",
      "None",
      cameraImageAsBase64,
      null,
      null,
      null,
      null,
      null,
      null,
      20,
      "Euler a",
      4,
      0,
      "original",
      false,
      false,
      1,
      1,
      7,
      0.75,
      -1,
      -1,
      0,
      0,
      0,
      false,
      HEIGHT,
      WIDTH,
      "Just resize",
      "Whole picture",
      32,
      "Inpaint masked",
      "",
      "",
      "None",
      "<ul>\n<li><code>CFG Scale</code> should be 2 or lower.</li>\n</ul>\n",
      true,
      true,
      "",
      "",
      true,
      50,
      true,
      1,
      0,
      false,
      4,
      1,
      '<p style="margin-bottom:0.75em">Recommended settings: Sampling Steps: 80-100, Sampler: Euler a, Denoising strength: 0.8</p>',
      128,
      8,
      ["left", "right", "up", "down"],
      1,
      0.05,
      128,
      4,
      "fill",
      ["left", "right", "up", "down"],
      false,
      false,
      false,
      false,
      "",
      '<p style="margin-bottom:0.75em">Will upscale the image by the selected scale factor; use width and height sliders to set tile size</p>',
      64,
      "None",
      2,
      "Seed",
      "",
      "Nothing",
      "",
      true,
      false,
      false,
      [],
      "",
      "",
      "",
    ],
    session_hash: "bm9imrjyvk4",
  };
  return fetch(`${userInput.publicGradioUrl}/run/predict/`, {
    credentials: "omit",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:108.0) Gecko/20100101 Firefox/108.0",
      Accept: "*/*",
      "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
      "Content-Type": "application/json",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
    },
    referrer: userInput.publicGradioUrl,
    body: JSON.stringify(bodyContent),
    method: "POST",
    mode: "cors",
  });
}

function fetchImg(imgPath) {
  return fetch(`${userInput.publicGradioUrl}/file=${imgPath}`, {
    credentials: "omit",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:108.0) Gecko/20100101 Firefox/108.0",
      Accept: "image/avif,image/webp,*/*",
      "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
      "Sec-Fetch-Dest": "image",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "same-origin",
    },
    referrer: userInput.publicGradioUrl,
    method: "GET",
    mode: "cors",
  });
}

//two-way DOM-state-bindings that React would do automatically
function clearUI() {
  //inputImg.src = "";
  resultImg.src = "";
  inputImageCaption.innerHTML = "";
  resultImgCaption.innerHTML = "";
}
function collectUserInput() {
  const cameraImageAsBase64 = canvasElement.toDataURL("image/jpeg");
  userInput.snapshot = cameraImageAsBase64;
  userInput.publicGradioUrl = inputApiUrl.value;
  if (!isValidApiUrl(userInput.publicGradioUrl)) {
    alert("Please enter a valid API URL");
  }
  userInput.promptAddition = inputPromptAddition.value;
}

function submit() {
  clearUI();
  interrogateClip(userInput.snapshot)
    .then((response) => response.json())
    .then(({ data }) => {
      const imageDescription = removeArtistName(data[0]);
      inputImageCaption.innerHTML = imageDescription;
      const constructedPrompt = `${
        userInput.promptAddition || DEFAULT_PROMPT_ADDITION
      }, ${inputUseInterrogate.checked ? imageDescription : ""}`;
      resultImgCaption.innerHTML = constructedPrompt;
      return requestimg2img(userInput.snapshot, constructedPrompt);
    })
    .then((response) => response.json())
    .then(({ data }) => data[0][0]["name"])
    .then((imgPath) => {
      resultImg.src = `${userInput.publicGradioUrl}/file=${imgPath}`;
    });
}
