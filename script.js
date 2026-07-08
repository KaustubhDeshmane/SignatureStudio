document.addEventListener("DOMContentLoaded", () => {

    // ============================
    // DOM ELEMENTS
    // ============================

    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    const colorPicker = document.getElementById("colorPicker");
    const canvasColor = document.getElementById("canvasColor");

    const brushSize = document.getElementById("brushSize");
    const brushValue = document.getElementById("brushValue");

    const clearButton = document.getElementById("clearButton");
    const saveButton = document.getElementById("saveButton");
    const retrieveButton = document.getElementById("retreive");
    const undoButton = document.getElementById("undoButton");


    // ============================
    // SETTINGS
    // ============================

    let isDrawing = false;

    let brushColor = colorPicker.value;
    let backgroundColor = "#ffffff";

    let lineWidth = parseInt(brushSize.value);

    let history = [];
    const MAX_HISTORY = 30;


    // ============================
    // CANVAS SETTINGS
    // ============================

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = lineWidth;


    // ============================
    // DRAW INITIAL BACKGROUND
    // ============================

    function fillCanvasBackground() {

        ctx.save();

        ctx.globalCompositeOperation = "destination-over";

        ctx.fillStyle = backgroundColor;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.restore();

    }

    fillCanvasBackground();


    // ============================
    // SAVE HISTORY
    // ============================

    function saveHistory() {

        if (history.length >= MAX_HISTORY) {

            history.shift();

        }

        history.push(canvas.toDataURL());

    }

    saveHistory();


    // ============================
    // POINTER POSITION
    // ============================

    function getPosition(event) {

        const rect = canvas.getBoundingClientRect();

        if (event.touches) {

            return {

                x:
                    (event.touches[0].clientX - rect.left) *
                    (canvas.width / rect.width),

                y:
                    (event.touches[0].clientY - rect.top) *
                    (canvas.height / rect.height)

            };

        }

        return {

            x:
                (event.clientX - rect.left) *
                (canvas.width / rect.width),

            y:
                (event.clientY - rect.top) *
                (canvas.height / rect.height)

        };

    }


    // ============================
    // START DRAWING
    // ============================

    function startDrawing(event) {

        event.preventDefault();

        isDrawing = true;

        saveHistory();

        const position = getPosition(event);

        ctx.beginPath();

        ctx.moveTo(
            position.x,
            position.y
        );

    }


    // ============================
    // DRAW
    // ============================

    function draw(event) {

        if (!isDrawing) return;

        event.preventDefault();

        const position = getPosition(event);

        ctx.lineTo(
            position.x,
            position.y
        );

        ctx.stroke();

    }


    // ============================
    // STOP DRAWING
    // ============================

    function stopDrawing() {

        if (!isDrawing) return;

        isDrawing = false;

        fillCanvasBackground();

        localStorage.setItem(
            "canvasContents",
            canvas.toDataURL()
        );

    }


    // ============================
    // MOUSE EVENTS
    // ============================

    canvas.addEventListener(
        "mousedown",
        startDrawing
    );

    canvas.addEventListener(
        "mousemove",
        draw
    );

    window.addEventListener(
        "mouseup",
        stopDrawing
    );


    // ============================
    // TOUCH EVENTS
    // ============================

    canvas.addEventListener(
        "touchstart",
        startDrawing,
        { passive: false }
    );

    canvas.addEventListener(
        "touchmove",
        draw,
        { passive: false }
    );

    window.addEventListener(
        "touchend",
        stopDrawing
    );

        // ============================
    // BRUSH COLOR
    // ============================

    colorPicker.addEventListener("input", (event) => {

        brushColor = event.target.value;

        ctx.strokeStyle = brushColor;

    });


    // ============================
    // BRUSH SIZE
    // ============================

    brushSize.addEventListener("input", (event) => {

        lineWidth = parseInt(event.target.value);

        ctx.lineWidth = lineWidth;

        brushValue.textContent = `${lineWidth} px`;

    });


    // ============================
    // CANVAS BACKGROUND COLOR
    // ============================

    canvasColor.addEventListener("input", (event) => {

        backgroundColor = event.target.value;

        const snapshot = canvas.toDataURL();

        const image = new Image();

        image.src = snapshot;

        image.onload = () => {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.fillStyle = backgroundColor;

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.drawImage(
                image,
                0,
                0
            );

            ctx.strokeStyle = brushColor;

            ctx.lineWidth = lineWidth;

            saveHistory();

            localStorage.setItem(
                "canvasContents",
                canvas.toDataURL()
            );

        };

    });


    // ============================
    // UNDO
    // ============================

    undoButton.addEventListener("click", () => {

        if (history.length <= 1) return;

        history.pop();

        const previousImage = history[history.length - 1];

        const image = new Image();

        image.src = previousImage;

        image.onload = () => {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.drawImage(
                image,
                0,
                0
            );

            ctx.strokeStyle = brushColor;

            ctx.lineWidth = lineWidth;

        };

    });


    // ============================
    // CLEAR CANVAS
    // ============================

    clearButton.addEventListener("click", () => {

        if (!confirm("Clear the entire signature?"))
            return;

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = backgroundColor;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        saveHistory();

        localStorage.setItem(
            "canvasContents",
            canvas.toDataURL()
        );

    });

        // ============================
    // RETRIEVE SAVED SIGNATURE
    // ============================

    retrieveButton.addEventListener("click", () => {

        const savedCanvas = localStorage.getItem("canvasContents");

        if (!savedCanvas) {

            showToast("No saved signature found.", "#ef4444");

            return;

        }

        const image = new Image();

        image.src = savedCanvas;

        image.onload = () => {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.strokeStyle = brushColor;

            ctx.lineWidth = lineWidth;

            saveHistory();

            showToast("Signature restored successfully.");

        };

    });



    // ============================
    // AUTO SAVE
    // ============================

    function autoSave() {

        localStorage.setItem(
            "canvasContents",
            canvas.toDataURL()
        );

    }



    canvas.addEventListener(
        "mouseup",
        autoSave
    );

    canvas.addEventListener(
        "touchend",
        autoSave
    );



    // ============================
    // KEYBOARD SHORTCUTS
    // ============================

    document.addEventListener("keydown", (event) => {

        // CTRL + Z

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "z"
        ) {

            event.preventDefault();

            undoButton.click();

        }


        // CTRL + S

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "s"
        ) {

            event.preventDefault();

            saveButton.click();

        }


        // DELETE

        if (
            event.key === "Delete"
        ) {

            clearButton.click();

        }

    });



    // ============================
    // EXPORT FUNCTION
    // ============================

    function downloadCanvas() {

        fillCanvasBackground();

        const image = canvas.toDataURL("image/png");

        const link = document.createElement("a");

        link.download = "signature.png";

        link.href = image;

        link.click();

    }



    saveButton.addEventListener(
        "click",
        downloadCanvas
    );



    // ============================
    // WINDOW LEAVE
    // ============================

    canvas.addEventListener(
        "mouseleave",
        stopDrawing
    );

        // ============================
    // TOAST NOTIFICATION
    // ============================

    function showToast(message, color = "#22c55e") {

        const existing = document.querySelector(".signature-toast");

        if (existing) {

            existing.remove();

        }

        const toast = document.createElement("div");

        toast.className = "signature-toast";

        toast.innerText = message;

        toast.style.position = "fixed";
        toast.style.bottom = "30px";
        toast.style.right = "30px";
        toast.style.padding = "14px 22px";
        toast.style.background = color;
        toast.style.color = "#fff";
        toast.style.fontWeight = "600";
        toast.style.borderRadius = "12px";
        toast.style.boxShadow = "0 10px 30px rgba(0,0,0,.25)";
        toast.style.zIndex = "9999";
        toast.style.opacity = "0";
        toast.style.transition = ".35s";

        document.body.appendChild(toast);

        requestAnimationFrame(() => {

            toast.style.opacity = "1";

        });

        setTimeout(() => {

            toast.style.opacity = "0";

            setTimeout(() => {

                toast.remove();

            }, 350);

        }, 2200);

    }


    // ============================
    // AUTO LOAD SAVED SIGNATURE
    // ============================

    function loadSavedSignature() {

        const savedCanvas = localStorage.getItem("canvasContents");

        if (!savedCanvas) return;

        const image = new Image();

        image.src = savedCanvas;

        image.onload = () => {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
            );

            saveHistory();

        };

    }



    // ============================
    // INITIALIZE
    // ============================


    loadSavedSignature();

    brushValue.textContent = `${lineWidth} px`;

    showToast("Signature Studio Ready ✨");

    /* ============================================
    LIVE BRUSH CURSOR
    ============================================ */

    const brushCursor = document.getElementById("brushCursor");

    function updateBrushCursor(event) {

        const rect = canvas.getBoundingClientRect();

        brushCursor.style.left = `${event.clientX - rect.left}px`;
        brushCursor.style.top = `${event.clientY - rect.top}px`;

    }

    canvas.addEventListener("mouseenter", () => {

        brushCursor.style.opacity = "1";

    });

    canvas.addEventListener("mouseleave", () => {

        brushCursor.style.opacity = "0";

    });

    canvas.addEventListener("mousemove", (event) => {

        updateBrushCursor(event);

    });

    canvas.addEventListener("touchmove", (event) => {

        const touch = event.touches[0];

        updateBrushCursor(touch);

    });



    /* ============================================
    UPDATE CURSOR SIZE
    ============================================ */

    function updateBrushAppearance() {

        const size = ctx.lineWidth;

        brushCursor.style.width = `${size}px`;
        brushCursor.style.height = `${size}px`;

    }

    updateBrushAppearance();



    /* ============================================
    BRUSH SIZE
    ============================================ */

    brushSize.addEventListener("input", (event) => {

        lineWidth = Number(event.target.value);

        ctx.lineWidth = lineWidth;

        brushValue.textContent = `${lineWidth} px`;

        updateBrushAppearance();

    });



    /* ============================================
    BRUSH COLOR
    ============================================ */

    colorPicker.addEventListener("input", (event) => {

        brushColor = event.target.value;

        ctx.strokeStyle = brushColor;

        brushCursor.style.borderColor = brushColor;

    });

    brushCursor.style.borderColor = brushColor;



});