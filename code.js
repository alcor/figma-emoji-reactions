var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__);
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    yield figma.loadFontAsync({ family: "Roboto", style: "Regular" });
    if (msg.type === 'add-reaction') {
        const frame = figma.createFrame();
        frame.resizeWithoutConstraints(300, 150);
        frame.name = "hello";
        frame.x = figma.viewport.center.x - frame.width / 2;
        frame.y = figma.viewport.center.y - frame.height / 2;
        frame.layoutMode = "HORIZONTAL";
        frame.horizontalPadding = 50;
        frame.verticalPadding = 50;
        frame.layoutAlign = "STRETCH";
        frame.cornerRadius = frame.height / 2;
        frame.bottomLeftRadius = 0;
        const label = figma.createText();
        label.layoutAlign = "STRETCH";
        label.resizeWithoutConstraints(100, 100);
        label.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
        label.characters = msg.string || "❤️";
        if (label.characters.length < 3)
            label.fontSize = 24;
        label.fontSize = 30;
        label.textAlignHorizontal = 'CENTER';
        label.textAlignVertical = 'CENTER';
        label.textAutoResize = "WIDTH_AND_HEIGHT";
        frame.appendChild(label);
        figma.group([frame], figma.currentPage);
        figma.viewport.scrollAndZoomIntoView([frame]);
        figma.currentPage.selection = [label];
    }
    figma.closePlugin();
});
