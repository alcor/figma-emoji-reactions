var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__, { width: 300, height: 400 });
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    const font = { family: "Arimo", style: "Bold" };
    yield figma.loadFontAsync(font);
    yield figma.loadFontAsync({ family: "Roboto", style: "Regular" });
    // comment bubble
    if (msg.type === 'add-reaction') {
        const frame = figma.createFrame();
        frame.resizeWithoutConstraints(128, 48);
        frame.x = figma.viewport.center.x - frame.width / 2;
        frame.y = figma.viewport.center.y - frame.height / 2;
        frame.layoutMode = "VERTICAL";
        frame.horizontalPadding = 16;
        frame.verticalPadding = 8;
        frame.layoutAlign = "STRETCH";
        frame.cornerRadius = frame.height / 2;
        frame.bottomLeftRadius = 0;
        frame.strokeAlign = 'OUTSIDE';
        frame.strokeWeight = 1;
        frame.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.2 }];
        var string = msg.string || "❤️";
        const label = figma.createText();
        label.layoutAlign = "STRETCH";
        label.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
        label.characters = string;
        label.fontSize = 18;
        if (label.characters.length <= 3)
            label.fontSize = 48;
        label.textAlignHorizontal = 'CENTER';
        label.textAlignVertical = 'CENTER';
        label.textAutoResize = "WIDTH_AND_HEIGHT";
        label.fontName = font;
        frame.appendChild(label);
        var group = figma.group([frame], figma.currentPage);
        group.name = "Reaction: " + string;
        figma.currentPage.selection = [group];
        figma.closePlugin();
        // sticky note
    }
    else if (msg.type === "add-sticky") {
        // fill color - hook this up later to something like `msg.fillColor`
        const fillColor = { r: 255 / 255, g: 231 / 255, b: 170 / 255 };
        const frame = figma.createFrame();
        frame.resizeWithoutConstraints(200, 200);
        frame.x = figma.viewport.center.x - frame.width / 2;
        frame.y = figma.viewport.center.y - frame.height / 2;
        frame.horizontalPadding = frame.verticalPadding = 16;
        // frame.layoutMode = "VERTICAL"
        frame.fills = [{ type: "SOLID", color: fillColor }];
        frame.strokeAlign = "INSIDE";
        frame.strokeWeight = 1;
        frame.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.15 }];
        frame.effects = [shadowEffect];
        const text = figma.createText();
        text.resizeWithoutConstraints(180, 180);
        text.x = 10;
        text.y = 10;
        text.characters = msg.content || "🤙";
        text.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.8 }];
        text.fontName = font;
        text.fontSize = 18;
        text.textAlignHorizontal = "CENTER";
        text.textAlignVertical = "CENTER";
        frame.appendChild(text);
        const group = figma.group([frame], figma.currentPage);
        group.name = `Sticky: ${text.characters}`;
        figma.currentPage.selection = [group];
        figma.closePlugin();
        // emoji reaction  
    }
    else if (msg.type === "add-emoji") {
        console.log("Emoji");
        console.log(msg);
        const frame = figma.createFrame();
        frame.x = figma.viewport.center.x - frame.width / 2;
        frame.y = figma.viewport.center.y - frame.height / 2;
        frame.horizontalPadding = frame.verticalPadding = 24;
        frame.layoutMode = "HORIZONTAL";
        frame.primaryAxisSizingMode = "AUTO";
        frame.counterAxisSizingMode = "AUTO";
        frame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        frame.strokeAlign = "INSIDE";
        frame.strokeWeight = 1;
        frame.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.15 }];
        frame.effects = [shadowEffect];
        frame.cornerRadius = frame.height / 2;
        const text = figma.createText();
        text.x = 10;
        text.y = 10;
        text.characters = msg.content || "👍";
        text.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.8 }];
        text.fontName = font;
        text.fontSize = 42;
        text.textAlignHorizontal = "CENTER";
        text.textAlignVertical = "CENTER";
        frame.appendChild(text);
        const group = figma.group([frame], figma.currentPage);
        group.name = `Sticky: ${text.characters}`;
        figma.currentPage.selection = [group];
        figma.closePlugin();
        // meme image
    }
    else if (msg.type === "add-meme") {
        var memeType = msg.memeType || "satisfied";
        var topText = msg.topText || "Wrote this code";
        var bottomText = msg.bottomText || "Meme appeared";
        memeType = memeType.split(" ").join("_");
        topText = topText.split(" ").join("_");
        bottomText = bottomText.split(" ").join("_");
        // really slow to use this proxy to avoid cors error
        // we need to disable UI and show a loading state tho
        const url = `https://cors-anywhere.herokuapp.com/https://urlme.me/${memeType}/${topText}/${bottomText}.jpg`;
        figma.ui.postMessage({ type: 'getImageData', url });
        // handle image data
    }
    else if (msg.type === "image-data-received") {
        const imageFrame = figma.createFrame();
        imageFrame.resizeWithoutConstraints(200, 200);
        console.log(imageFrame);
        console.log(msg.data);
        imageFrame.fills = makeFillFromImageData(msg.data);
        imageFrame.x = figma.viewport.center.x - imageFrame.width / 2;
        imageFrame.y = figma.viewport.center.y - imageFrame.height / 2;
        // had to move this into each condition so it doesn't close before we get the image data
        figma.closePlugin();
    }
});
// shadow effect style
const shadowEffect = {
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: .25 },
    offset: { x: 4, y: 4 },
    radius: 0,
    visible: true,
    blendMode: "NORMAL",
};
// make image data into a fill
function makeFillFromImageData(data) {
    let imageHash = figma.createImage(data).hash;
    const newFill = {
        type: "IMAGE",
        filters: {
            contrast: 0,
            exposure: 0,
            highlights: 0,
            saturation: 0,
            shadows: 0,
            temperature: 0,
            tint: 0,
        },
        imageHash,
        imageTransform: [
            [1, 0, 0],
            [0, 1, 0]
        ],
        opacity: 1,
        scaleMode: "FIT",
        scalingFactor: 0.5,
        visible: true,
    };
    return ([newFill]);
}
