import * as React from "react";
import {
    getStrokeDasharrayCanvas,
    getMouseCanvas,
    GenericChartComponent,
    noop,
    strokeDashTypes,
} from "@react-financial-charts/core";

interface BrushProps {
    readonly enabled: boolean;
    readonly onStart: any; // func
    readonly onBrush: any; // func
    readonly type?: "1D" | "2D";
    readonly strokeStyle?: string;
    readonly fillStyle?: string;
    readonly interactiveState: object;
    readonly strokeDashArray?: strokeDashTypes;
}

interface BrushState {
    end?: any;
    rect: any | null;
    selected?: boolean;
    start?: any;
    x1y1?: any;
}

export class Brush extends React.Component<BrushProps, BrushState> {
    public static defaultProps = {
        type: "2D",
        strokeStyle: "#000000",
        fillStyle: "#3h3h3h",
        onBrush: noop,
        onStart: noop,
        strokeDashArray: "ShortDash",
    };

    private zoomHappening?: boolean;

    constructor(props: BrushProps, context) {
        super(props, context);

        this.terminate = this.terminate.bind(this);
        this.state = {
            rect: null,
        };
    }

    public terminate() {
        this.zoomHappening = false;
        this.setState({
            x1y1: null,
            start: null,
            end: null,
            rect: null,
        });
    }

    public render() {
        const { enabled } = this.props;
        if (!enabled) {
            return null;
        }

        return (
            <GenericChartComponent
                disablePan={enabled}
                canvasToDraw={getMouseCanvas}
                canvasDraw={this.drawOnCanvas}
                onMouseDown={this.handleZoomStart}
                onMouseMove={this.handleDrawSquare}
                onClick={this.handleZoomComplete}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D) => {
        const { rect } = this.state;
        if (rect !== null) {
            const { x, y, height, width } = rect;
            const {
                strokeStyle = Brush.defaultProps.strokeStyle,
                fillStyle = Brush.defaultProps.fillStyle,
                strokeDashArray,
            } = this.props;

            const dashArray = getStrokeDasharrayCanvas(strokeDashArray);

            ctx.strokeStyle = strokeStyle;
            ctx.fillStyle = fillStyle;
            ctx.setLineDash(dashArray);
            ctx.beginPath();
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);
        }
    };

    private readonly handleZoomStart = (moreProps) => {
        this.zoomHappening = false;
        const {
            mouseXY: [, mouseY],
            currentItem,
            chartConfig: { yScale },
            xAccessor,
            xScale,
        } = moreProps;

        const x1y1 = [xScale(xAccessor(currentItem)), mouseY];

        this.setState({
            selected: true,
            x1y1,
            start: {
                item: currentItem,
                xValue: xAccessor(currentItem),
                yValue: yScale.invert(mouseY),
            },
        });
    };

    private readonly handleDrawSquare = (moreProps) => {
        if (this.state.x1y1 == null) {
            return;
        }

        this.zoomHappening = true;

        const {
            mouseXY: [, mouseY],
            currentItem,
            chartConfig: { yScale },
            xAccessor,
            xScale,
        } = moreProps;

        const [x2, y2] = [xScale(xAccessor(currentItem)), mouseY];

        const {
            x1y1: [x1, y1],
        } = this.state;

        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const height = Math.abs(y2 - y1);
        const width = Math.abs(x2 - x1);

        this.setState({
            selected: true,
            end: {
                item: currentItem,
                xValue: xAccessor(currentItem),
                yValue: yScale.invert(mouseY),
            },
            rect: {
                x,
                y,
                height,
                width,
            },
        });
    };

    private readonly handleZoomComplete = (moreProps) => {
        if (this.zoomHappening) {
            const { onBrush } = this.props;
            const { start, end } = this.state;
            onBrush({ start, end }, moreProps);
        }
        this.setState({
            selected: false,
            rect: null,
        });
    };
}
