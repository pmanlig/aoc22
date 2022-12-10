import React, { useRef, useEffect } from 'react';
import { drawFilledRect } from './Drawing';

export const Bitmap = ({ data, styles, pixelSize, width, height }) => {
	pixelSize = pixelSize || 5;
	width = width || 500;
	height = height || 300;
	const ref = useRef(null);
	useEffect(() => {
		const ctx = ref.current.getContext("2d");
		ctx.scale(1, 1);
		for (let y = 0; y < data.length; y++) {
			for (let x = 0; x < data[y].length; x++) {
				drawFilledRect(ctx, pixelSize * x, pixelSize * y, pixelSize * (x + 1), pixelSize * (y + 1), styles && styles[data[y][x]]);
			}
		}
	});
	return <canvas ref={ref} width={width} height={height} />
}