const restrictionColors = {
	"1P": "#FF0000", // Red
	"2P": "#FF7F00", // Orange
	"3P": "#FFFF00", // Yellow
	"4P": "#008000", // Green
	"5P": "#0000FF", // Blue
	DP2P: "#A52A2A", // Brown
	FP15: "#800080", // Purple
	FP1P: "#FFC0CB", // Pink
	FP2P: "#D2691E", // Chocolate
	HP: "#00FFFF", // Cyan
	LZ15: "#800000", // Maroon
	LZ30: "#808080", // Gray
	MP1P: "#FFD700", // Gold
	MP2P: "#FF1493", // Deep Pink
	MP3P: "#FF6347", // Tomato
	MP4P: "#00008B", // Dark Blue
	PP: "#006400", // Dark Green
	QP: "#B8860B", // Dark Goldenrod
	SP: "#4682B4", // Steel Blue
};

let map;
async function loadParkingData() {
	const [segments, segmentToZone, zoneRules] = await Promise.all([
		fetch("road-segment.json").then((res) => res.json()),
		fetch("parking-zones-linked-to-street-segments.json").then((res) =>
			res.json()
		),
		fetch("sign-plates-located-in-each-parking-zone.json").then((res) =>
			res.json()
		),
	]);

	return { segments, segmentToZone, zoneRules };
}

// Utility function to get the current day of the week
function getCurrentDay() {
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const currentDate = new Date();
	return days[currentDate.getDay()];
}

// Utility function to check if current time is within the restriction window
function isWithinTimeWindow(start, end) {
	const currentTime = new Date();
	const startTime = new Date();
	const endTime = new Date();

	const [startHour, startMinute] = start.split(":");
	const [endHour, endMinute] = end.split(":");

	startTime.setHours(startHour, startMinute, 0);
	endTime.setHours(endHour, endMinute, 0);

	return currentTime >= startTime && currentTime <= endTime;
}

// Check if the current day is within the restriction days
function isValidDay(restrictionDays) {
	const currentDay = getCurrentDay();
	const daysArray = restrictionDays.split("-");
	return daysArray.includes(currentDay);
}

async function initMap() {
	const position = { lat: -37.8136, lng: 144.9631 }; // Melbourne CBD
	// Request needed libraries.
	//@ts-ignore
	await google.maps.importLibrary("maps");

	map = new google.maps.Map(document.getElementById("map"), {
		center: position,
		zoom: 17,
	});

	const { segments, segmentToZone, zoneRules } = await loadParkingData();
	const segmentGeoMap = new Map(segments.map((s) => [Number(s.segid), s]));
	const zoneRuleMap = new Map();

	for (const rule of zoneRules) {
		if (!zoneRuleMap.has(rule.parkingzone))
			zoneRuleMap.set(rule.parkingzone, []);
		zoneRuleMap.get(rule.parkingzone).push(rule);
	}

	// Draw to map
	for (const link of segmentToZone) {
		const segment = segmentGeoMap.get(link.segment_id);
		if (!segment || !segment.geo_shape) continue;

		const coords = extractPolygonCoords(segment.geo_shape.geometry);
		const ruleInfo = zoneRuleMap.get(link.parkingzone) || [];

		// Get the first restriction display and check if it's valid based on time and day
		let colour = "#808080"; // Default to grey if unknown or no rules apply

		if (ruleInfo.length) {
			for (const rule of ruleInfo) {
				const {
					restriction_display,
					restriction_days,
					time_restrictions_start,
					time_restrictions_finish,
				} = rule;

				if (
					isValidDay(restriction_days) &&
					isWithinTimeWindow(
						time_restrictions_start,
						time_restrictions_finish
					)
				) {
					colour =
						restrictionColors[restriction_display] || "#808080"; // Color if restriction is active
					break; // If any rule matches the current time/day, apply it
				}
			}
		}

		const poly = new google.maps.Polygon({
			paths: coords,
			strokeColor: colour,
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: colour,
			fillOpacity: 0.35,
			map,
		});

		const content = ruleInfo.length
			? ruleInfo
					.map(
						(r) =>
							`${r.restriction_display} ${r.restriction_days} ${r.time_restrictions_start}–${r.time_restrictions_finish}`
					)
					.join("<br>")
			: "No restriction info";

		const infowindow = new google.maps.InfoWindow({
			content: `
        <strong>${link.onstreet}</strong><br>
        Zone: ${link.parkingzone}<br>
        ${content}
      `,
		});

		poly.addListener("click", (e) => {
			infowindow.setPosition(e.latLng);
			infowindow.open(map);
		});
	}
}

function extractPolygonCoords(geometry) {
	if (!geometry || geometry.type !== "MultiPolygon") return [];

	// Extract outer polygon path only
	return geometry.coordinates[0][0].map(([lng, lat]) => ({ lat, lng }));
}

const BASE_URL =
	"https://data.melbourne.vic.gov.au/api/explore/v2.1/catalog/datasets";

initMap();
