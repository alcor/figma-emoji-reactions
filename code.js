var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let width = 320;
let height = 228;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let settings = yield figma.clientStorage.getAsync("settings");
        let firstRun = yield figma.clientStorage.getAsync("firstRun");
        if (firstRun == undefined) { // Open shifted up one window to avoid occlusion
            figma.showUI(__html__, { width: width, height: height * 3, visible: false });
            figma.ui.show();
            figma.ui.resize(width, height);
            figma.clientStorage.setAsync("firstRun", true);
        }
        else {
            figma.showUI(__html__, { width: width, height: height, visible: true });
        }
        console.log("Loading settings");
        figma.ui.postMessage({ type: 'settings', settings });
    });
}
var placedEmojiGroup;
let activeEmoji = [];
figma.on("close", () => {
    activeEmoji.forEach(group => {
        group.remove();
    });
});
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    if (msg.type === 'settings') {
        console.log("Setting received", msg.settings);
        yield figma.clientStorage.setAsync("settings", msg.settings);
        return;
    }
    else if (msg.type === 'cancel') {
        figma.closePlugin();
    }
    const font = { family: "Inter", style: "Regular" };
    yield figma.loadFontAsync(font);
    yield figma.loadFontAsync({ family: "Inter", style: "Medium" });
    let anchorX = figma.viewport.center.x;
    let anchorY = figma.viewport.center.y;
    let zoom = figma.viewport.zoom;
    let s = 1 / zoom;
    let bounds = figma.viewport.bounds;
    // TODO: check to make sure selection is visible / in bounds
    let selection = figma.currentPage.selection[0];
    let name = msg.settings.name;
    let sibling = undefined;
    if (selection) {
        anchorX = selection.absoluteTransform[0][2] + selection.width;
        ;
        anchorY = selection.absoluteTransform[1][2];
        if (selection.getPluginData('type') == "chat") {
            sibling = selection;
        }
    }
    let color = { r: 1, g: 1, b: 1 };
    if (msg.color) {
        var components = msg.color.match(/rgb\((\d+), ?(\d+), ?(\d+)\)/);
        if (components)
            color = { r: parseInt(components[1]) / 255, g: parseInt(components[2]) / 255, b: parseInt(components[3]) / 255 };
    }
    var isWhite = color.r + color.g + color.b == 3;
    const bevelEffect = {
        type: "INNER_SHADOW",
        color: { r: 0, g: 0, b: 0, a: isWhite ? 0.1 : 1 },
        offset: { x: -1 * s, y: -3 * s },
        radius: 0,
        visible: true,
        blendMode: isWhite ? "HARD_LIGHT" : "SOFT_LIGHT",
    };
    let shadowEffect = {
        type: "DROP_SHADOW",
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: 1 * s },
        radius: 3 * s,
        visible: true,
        blendMode: "HARD_LIGHT",
    };
    // comment bubble
    /*
    if (msg.type === 'add-bubble') {
  
      const text = figma.createText()
      xtext.characters = string
      xtext.fontName = font
  x    text.fontSize = text.characters.length <= 3 ? 36 * s : 18 * s
  x    text.textAlignHorizontal = 'LEFT'
  x    text.textAlignVertical = 'CENTER'
  x    text.textAutoResize = "WIDTH_AND_HEIGHT"
  
   
  
        text.x = anchorX
        text.y = anchorY - text.height
        text.fills = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0} }]
        text.textAutoResize = "NONE"
  
  
        
        frame.resizeWithoutConstraints(text.width + 30 * s, text.height + 20 * s)
        frame.x = anchorX  - 15 * s
        frame.y = anchorY - text.height - 10 * s
        frame.layoutAlign = "STRETCH"
        frame.cornerRadius = 24 * s;
        frame.bottomLeftRadius = 0;
        frame.fills = [{ type: 'SOLID', color: color }]
        frame.strokes = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0}, opacity: 0.1 }]
        frame.strokeAlign = 'OUTSIDE'
        frame.strokeWeight = 1 * s
        frame.effects = [bevelEffect, shadowEffect]
        frame.appendChild(text)
      //frame.appendChild(title)
       frame.expanded = false
  
        var group = figma.group([frame], figma.currentPage)
        group.name = `${name || "Comment"}: ${text.characters}`
        group.expanded = false;
        figma.currentPage.selection = [group];
  
      if (msg.ctrlKey) figma.closePlugin();
  
  
    // sticky note
    } else
    */
    if (msg.type === 'add-bubble' || msg.type === "add-sticky") {
        const bubble = msg.type === 'add-bubble';
        const frame = figma.createFrame();
        const text = figma.createText();
        text.resizeWithoutConstraints(200 * s, 160 * s);
        text.characters = msg.string || "🤙";
        text.fontName = font;
        text.fontSize = bubble ? (text.characters.length <= 3 ? 36 * s : 18 * s) : 18 * s;
        text.textAlignHorizontal = bubble ? "LEFT" : "CENTER";
        text.textAlignVertical = "CENTER";
        text.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.8 }];
        text.layoutAlign = "STRETCH";
        text.layoutGrow = 1;
        if (bubble) {
            text.textAutoResize = "WIDTH_AND_HEIGHT";
            if (text.width > 240 * s) {
                text.resizeWithoutConstraints(240 * s, 100 * s);
                text.textAutoResize = "HEIGHT";
            }
            text.x = anchorX;
            text.y = anchorY - text.height;
            text.textAutoResize = "HEIGHT";
        }
        else { // sticky
            text.x = anchorX - text.width / 2;
            text.y = anchorY - text.height / 2;
        }
        //    text.textAutoResize = "NONE"
        let caption = undefined;
        if (msg.settings.caption && msg.settings.caption.length) {
            caption = figma.createText();
            caption.resizeWithoutConstraints(200 * s, 8 * s);
            caption.characters = msg.settings.caption;
            caption.fontName = font;
            caption.fontSize = 9 * s;
            caption.opacity = 0.5;
            caption.textAlignHorizontal = bubble ? "LEFT" : "CENTER";
            caption.textAlignVertical = "BOTTOM";
            caption.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.8 }];
            caption.x = anchorX - caption.width / 2;
            caption.y = anchorY - caption.height / 2;
            caption.layoutAlign = "STRETCH";
        }
        frame.paddingBottom = frame.paddingLeft = frame.paddingTop = frame.paddingRight = 10 * s;
        frame.layoutMode = "VERTICAL";
        frame.primaryAxisSizingMode = "AUTO";
        frame.counterAxisSizingMode = "AUTO";
        frame.itemSpacing = 1 * s;
        frame.counterAxisAlignItems = "CENTER";
        if (bubble) {
            frame.resizeWithoutConstraints(text.width + 30 * s, text.height + 20 * s);
            frame.x = anchorX - 15 * s;
            frame.y = anchorY - text.height - 10 * s;
            frame.layoutAlign = "STRETCH";
            frame.cornerRadius = 24 * s;
            frame.bottomLeftRadius = 0;
            if (caption)
                frame.paddingBottom /= 3;
            frame.paddingLeft = 15 * s;
            frame.itemSpacing = s * 6;
        }
        else {
            frame.resizeWithoutConstraints(text.width + 10 * s, text.height + 10 * s);
            frame.x = anchorX - frame.width / 2;
            frame.y = anchorY - frame.height / 2;
        }
        frame.fills = [{ type: "SOLID", color: color }];
        frame.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.1 }];
        frame.strokeAlign = 'OUTSIDE';
        frame.strokeWeight = 1 * s;
        frame.effects = [bevelEffect, shadowEffect];
        frame.appendChild(text);
        if (caption)
            frame.appendChild(caption);
        text.textAutoResize = "HEIGHT";
        frame.expanded = false;
        const group = figma.group([frame], figma.currentPage);
        group.name = `${caption || bubble ? "Comment" : "Sticky"}: ${text.characters}`;
        group.expanded = false;
        figma.currentPage.selection = [group];
        group.setPluginData('type', 'chat');
        // if (sibling) {
        //   let container = sibling.parent
        //   if (container.getPluginData('type') != 'chat-group') {
        //   }
        //   sibling.appendChild(group);
        // }
        if (msg.ctrlKey)
            figma.closePlugin();
        // emoji reaction  
    }
    else if (msg.type === "add-emoji") {
        if (placedEmojiGroup !== undefined) {
            return;
        }
        const frame = figma.createRectangle();
        frame.resizeWithoutConstraints(72 * s, 72 * s);
        frame.x = anchorX - 36 * s;
        frame.y = anchorY - 36 * s;
        frame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        frame.strokeAlign = "INSIDE";
        frame.strokeWeight = 1;
        frame.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.15 }];
        frame.effects = [bevelEffect, shadowEffect];
        frame.cornerRadius = frame.height / 2;
        const text = figma.createText();
        text.resizeWithoutConstraints(72 * s, 72 * s);
        text.x = frame.x;
        text.y = frame.y;
        text.characters = msg.content || "👍";
        if (text.characters == "❤️") {
            text.y += 5 * s;
        }
        text.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.8 }];
        text.fontName = font;
        text.fontSize = 42 * s;
        text.textAlignHorizontal = "CENTER";
        text.textAlignVertical = "CENTER";
        const group = figma.group([text, frame], figma.currentPage);
        group.name = group.name = `${name ? name + ": " : ""}${text.characters}`;
        group.expanded = false;
        placedEmojiGroup = group;
        if (msg.altPressed) { // floatmoji
            frame.opacity = 0.0;
            var duration = 1.0 * 1000;
            var driftX = s * ((Math.random() * 2) - 1) / 4;
            var driftY = s * ((Math.random() * 2) - 1) * 4;
            group.x += driftX * 4;
            group.y += driftY;
            let startY = group.y;
            activeEmoji.push(group);
            var then = new Date().getTime();
            var interval = setInterval((i) => {
                let now = new Date().getTime();
                let progress = (now - then) / duration;
                if (progress < 1.0) {
                    group.y = startY - (Math.pow(15 * progress, 2) * s);
                    group.x = group.x += driftX * s;
                    group.opacity = 1.0 - Math.pow(progress, 2);
                }
                else {
                    let i = activeEmoji.indexOf(group);
                    if (i != -1)
                        activeEmoji.splice(i, 1);
                    clearInterval(interval);
                    group.remove();
                }
            }, 50);
            placedEmojiGroup = undefined;
        }
        else { // bigmoji
            var duration = 2 * 1000;
            let startX = placedEmojiGroup.x + placedEmojiGroup.width / 2;
            let startY = placedEmojiGroup.y + placedEmojiGroup.height / 2;
            var then = new Date().getTime();
            var interval = setInterval((i) => {
                let now = new Date().getTime();
                let progress = (now - then) / duration;
                if (progress < 1.5 && placedEmojiGroup != undefined) {
                    if (progress > 0.25) {
                        // frame.opacity = 0.0;
                        let scaleFactor = translateValue(progress, [.5, 2.5], [1.0075, 1.0125]);
                        placedEmojiGroup.rescale(scaleFactor);
                        placedEmojiGroup.x = startX - placedEmojiGroup.width / 2;
                        placedEmojiGroup.y = startY - placedEmojiGroup.height / 2;
                    }
                }
                else {
                    placedEmojiGroup = undefined;
                    clearInterval(interval);
                    // group.remove()
                }
            }, 25);
            figma.currentPage.selection = [group];
            // figma.closePlugin()
        }
    }
    else if (msg.type === "emoji-mouseup" && !msg.altPressed || msg.type === "emoji-mouseout") {
        placedEmojiGroup = undefined;
    }
});
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
// modulate a value from one range to another
function translateValue(value, from, to) {
    var scale = (to[1] - to[0]) / (from[1] - from[0]);
    var capped = (from[1], (from[0], value)) - from[0];
    return (capped * scale + to[0]);
}
main();
