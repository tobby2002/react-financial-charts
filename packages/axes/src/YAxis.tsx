import { strokeDashTypes } from "@react-financial-charts/core";
import * as PropTypes from "prop-types";
import * as React from "react";
import { Axis } from "./Axis";

interface YAxisProps {
    readonly axisAt?: number | "left" | "right" | "middle";
    readonly className?: string;
    readonly domainClassName?: string;
    readonly fill?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly getMouseDelta?: (startXY: [number, number], mouseXY: [number, number]) => number;
    readonly gridLinesStroke?: string;
    readonly gridLinesStrokeWidth?: number;
    readonly gridLinesStrokeDasharray?: strokeDashTypes;
    readonly innerTickSize?: number;
    readonly onContextMenu?: (e: React.MouseEvent, mousePosition: [number, number]) => void;
    readonly onDoubleClick?: (e: React.MouseEvent, mousePosition: [number, number]) => void;
    readonly orient?: "left" | "right";
    readonly outerTickSize?: number;
    readonly showDomain?: boolean;
    readonly showGridLines?: boolean;
    readonly showTicks?: boolean;
    readonly showTickLabel?: boolean;
    readonly strokeStyle?: string | CanvasGradient | CanvasPattern;
    readonly strokeWidth?: number;
    readonly tickFormat?: (data: any) => string;
    readonly tickPadding?: number;
    readonly tickSize?: number;
    readonly tickLabelFill?: string;
    readonly ticks?: number;
    readonly tickStroke?: string;
    readonly tickStrokeOpacity?: number;
    readonly tickStrokeWidth?: number;
    readonly tickStrokeDasharray?: strokeDashTypes;
    readonly tickValues?: number[];
    readonly yZoomWidth?: number;
    readonly zoomEnabled?: boolean;
    readonly zoomCursorClassName?: string;
}

export class YAxis extends React.Component<YAxisProps> {
    public static defaultProps = {
        axisAt: "right",
        className: "react-financial-charts-y-axis",
        domainClassName: "react-financial-charts-axis-domain",
        fill: "none",
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 12,
        fontWeight: 400,
        getMouseDelta: (startXY, mouseXY) => startXY[1] - mouseXY[1],
        gridLinesStroke: "#E2E4EC",
        gridLinesStrokeWidth: 1,
        innerTickSize: 4,
        outerTickSize: 0,
        orient: "right",
        showDomain: true,
        showGridLines: false,
        showTicks: true,
        showTickLabel: true,
        strokeStyle: "#000000",
        strokeWidth: 1,
        tickPadding: 4,
        tickLabelFill: "#000000",
        tickStroke: "#000000",
        tickStrokeOpacity: 1,
        yZoomWidth: 40,
        zoomEnabled: true,
        zoomCursorClassName: "react-financial-charts-ns-resize-cursor",
    };

    public static contextTypes = {
        yAxisZoom: PropTypes.func.isRequired,
        chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        chartConfig: PropTypes.object.isRequired,
    };

    public render() {
        const {
            getMouseDelta = YAxis.defaultProps.getMouseDelta,
            outerTickSize = YAxis.defaultProps.outerTickSize,
            strokeStyle = YAxis.defaultProps.strokeStyle,
            strokeWidth = YAxis.defaultProps.strokeWidth,
            ...rest
        } = this.props;

        const { zoomEnabled, ...moreProps } = this.helper();

        return (
            <Axis
                {...rest}
                {...moreProps}
                edgeClip
                getMouseDelta={getMouseDelta}
                outerTickSize={outerTickSize}
                strokeStyle={strokeStyle}
                strokeWidth={strokeWidth}
                zoomEnabled={this.props.zoomEnabled && zoomEnabled}
                axisZoomCallback={this.axisZoomCallback}
            />
        );
    }

    private readonly axisZoomCallback = (newYDomain) => {
        const { chartId, yAxisZoom } = this.context;
        yAxisZoom(chartId, newYDomain);
    };

    private readonly helper = () => {
        const { axisAt, ticks, yZoomWidth = YAxis.defaultProps.yZoomWidth, orient } = this.props;
        const {
            chartConfig: { width, height },
        } = this.context;

        let axisLocation;
        const y = 0;
        const w = yZoomWidth;
        const h = height;

        switch (axisAt) {
            case "left":
                axisLocation = 0;
                break;
            case "right":
                axisLocation = width;
                break;
            case "middle":
                axisLocation = width / 2;
                break;
            default:
                axisLocation = axisAt;
        }

        const x = orient === "left" ? -yZoomWidth : 0;

        return {
            transform: [axisLocation, 0],
            range: [0, height],
            getScale: this.getYScale,
            bg: { x, y, h, w },
            ticks: ticks ?? this.getYTicks(height),
            zoomEnabled: this.context.chartConfig.yPan,
        };
    };

    private readonly getYTicks = (height: number) => {
        if (height < 300) {
            return 2;
        }

        if (height < 500) {
            return 6;
        }

        return 8;
    };

    private readonly getYScale = (moreProps) => {
        const { yScale: scale, flipYScale, height } = moreProps.chartConfig;
        if (scale.invert) {
            const trueRange = flipYScale ? [0, height] : [height, 0];
            const trueDomain = trueRange.map(scale.invert);
            return scale.copy().domain(trueDomain).range(trueRange);
        }
        return scale;
    };
}
