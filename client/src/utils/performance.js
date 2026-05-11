// Report Web Vitals
export const reportWebVitals = (onPerfEntry) => {
	if (onPerfEntry && onPerfEntry instanceof Function) {
		import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
			getCLS(onPerfEntry);
			getFID(onPerfEntry);
			getFCP(onPerfEntry);
			getLCP(onPerfEntry);
			getTTFB(onPerfEntry);
		});
	}
};

// Log performance marks
export const perfMark = (name) => {
	if (process.env.NODE_ENV === 'development') {
		performance.mark(name);
	}
};

export const perfMeasure = (name, startMark, endMark) => {
	if (process.env.NODE_ENV === 'development') {
		performance.measure(name, startMark, endMark);
		const measures = performance.getEntriesByName(name);
		console.log(`⏱️ ${name}: ${measures[0].duration.toFixed(2)}ms`);
	}
};