import { memo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useNavigate } from "react-router-dom";
import { TARGET_STATES } from "../utils/constants";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const USAMap = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-4xl mx-auto h-[400px] sm:h-[500px]">
      <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "100%" }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name;
              const isSupported = TARGET_STATES.includes(stateName);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (isSupported) {
                      navigate(`/state/${stateName.toLowerCase()}`);
                    }
                  }}
                  style={{
                    default: {
                      fill: isSupported ? "rgba(16, 185, 129, 0.2)" : "rgba(31, 41, 55, 0.5)", // emerald-500/20 or gray-800/50
                      outline: "none",
                      stroke: "rgba(75, 85, 99, 0.4)", // border-gray-600/40
                      strokeWidth: 0.75,
                    },
                    hover: {
                      fill: isSupported ? "rgba(16, 185, 129, 0.6)" : "rgba(31, 41, 55, 0.5)",
                      outline: "none",
                      cursor: isSupported ? "pointer" : "default",
                      stroke: isSupported ? "rgba(16, 185, 129, 1)" : "rgba(75, 85, 99, 0.4)",
                      strokeWidth: isSupported ? 1.5 : 0.75,
                    },
                    pressed: {
                      fill: isSupported ? "rgba(16, 185, 129, 0.8)" : "rgba(31, 41, 55, 0.5)",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default memo(USAMap);
