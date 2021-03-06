import { functor } from "@react-financial-charts/core";
import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";

interface SvgPathAnnotationProps {
    readonly className?: string;
    readonly datum?: any;
    readonly fill?: string | ((datum: any) => string);
    readonly onClick?: (
        e: React.MouseEvent,
        data: {
            xScale?: ScaleContinuousNumeric<number, number>;
            yScale?: ScaleContinuousNumeric<number, number>;
            datum: any;
        },
    ) => void;
    readonly opacity?: number;
    readonly path: any; // func
    readonly plotData: any[];
    readonly stroke?: string;
    readonly tooltip?: string | ((datum: any) => string);
    readonly xAccessor?: any; // func
    readonly x?: number | any; // func
    readonly xScale?: ScaleContinuousNumeric<number, number>;
    readonly y?: number | any; // func
    readonly yScale?: ScaleContinuousNumeric<number, number>;
}

export class SvgPathAnnotation extends React.Component<SvgPathAnnotationProps> {
    public static defaultProps = {
        className: "react-financial-charts-svg-path-annotation",
        opacity: 1,
        x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
    };

    public render() {
        const { className, stroke, opacity, path } = this.props;

        const { x, y, fill, tooltip } = this.helper();

        return (
            <g className={className} onClick={this.handleClick}>
                <title>{tooltip}</title>
                <path d={path({ x, y })} stroke={stroke} fill={fill} opacity={opacity} />
            </g>
        );
    }

    private readonly handleClick = (e: React.MouseEvent) => {
        const { onClick, xScale, yScale, datum } = this.props;
        if (onClick !== undefined) {
            onClick(e, { xScale, yScale, datum });
        }
    };

    private readonly helper = () => {
        const { x, y, datum, fill, tooltip, xAccessor, xScale, yScale, plotData } = this.props;

        const xFunc = functor(x);
        const yFunc = functor(y);

        const [xPos, yPos] = [xFunc({ xScale, xAccessor, datum, plotData }), yFunc({ yScale, datum, plotData })];

        return {
            x: xPos,
            y: yPos,
            fill: functor(fill)(datum),
            tooltip: functor(tooltip)(datum),
        };
    };
}
