"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/system/route";
exports.ids = ["app/api/system/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsystem%2Froute&page=%2Fapi%2Fsystem%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsystem%2Froute.ts&appDir=C%3A%5CUsers%5Cajmal%5CDesktop%5Ctouchpointe%5Cmess%20management%20system%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cajmal%5CDesktop%5Ctouchpointe%5Cmess%20management%20system&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsystem%2Froute&page=%2Fapi%2Fsystem%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsystem%2Froute.ts&appDir=C%3A%5CUsers%5Cajmal%5CDesktop%5Ctouchpointe%5Cmess%20management%20system%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cajmal%5CDesktop%5Ctouchpointe%5Cmess%20management%20system&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_ajmal_Desktop_touchpointe_mess_management_system_app_api_system_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/system/route.ts */ \"(rsc)/./app/api/system/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/system/route\",\n        pathname: \"/api/system\",\n        filename: \"route\",\n        bundlePath: \"app/api/system/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\ajmal\\\\Desktop\\\\touchpointe\\\\mess management system\\\\app\\\\api\\\\system\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_ajmal_Desktop_touchpointe_mess_management_system_app_api_system_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/system/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzeXN0ZW0lMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnN5c3RlbSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnN5c3RlbSUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNham1hbCU1Q0Rlc2t0b3AlNUN0b3VjaHBvaW50ZSU1Q21lc3MlMjBtYW5hZ2VtZW50JTIwc3lzdGVtJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNham1hbCU1Q0Rlc2t0b3AlNUN0b3VjaHBvaW50ZSU1Q21lc3MlMjBtYW5hZ2VtZW50JTIwc3lzdGVtJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUMwQztBQUN2SDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL21lc3MtbWFuYWdlbWVudC1zeXN0ZW0vPzllOTUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcYWptYWxcXFxcRGVza3RvcFxcXFx0b3VjaHBvaW50ZVxcXFxtZXNzIG1hbmFnZW1lbnQgc3lzdGVtXFxcXGFwcFxcXFxhcGlcXFxcc3lzdGVtXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9zeXN0ZW0vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9zeXN0ZW1cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3N5c3RlbS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXGFqbWFsXFxcXERlc2t0b3BcXFxcdG91Y2hwb2ludGVcXFxcbWVzcyBtYW5hZ2VtZW50IHN5c3RlbVxcXFxhcHBcXFxcYXBpXFxcXHN5c3RlbVxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvc3lzdGVtL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsystem%2Froute&page=%2Fapi%2Fsystem%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsystem%2Froute.ts&appDir=C%3A%5CUsers%5Cajmal%5CDesktop%5Ctouchpointe%5Cmess%20management%20system%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cajmal%5CDesktop%5Ctouchpointe%5Cmess%20management%20system&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/system/route.ts":
/*!*********************************!*\
  !*** ./app/api/system/route.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   PUT: () => (/* binding */ PUT)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_system__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/system */ \"(rsc)/./lib/system.ts\");\n/* harmony import */ var _lib_getToken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/getToken */ \"(rsc)/./lib/getToken.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\nasync function GET() {\n    const settings = await (0,_lib_system__WEBPACK_IMPORTED_MODULE_1__.getSystemSettings)();\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(settings);\n}\nconst isValidCoordinate = (lat, lng)=>Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;\nasync function PUT(req) {\n    const token = await (0,_lib_getToken__WEBPACK_IMPORTED_MODULE_2__.getAuthToken)(req);\n    if (token?.role !== \"ADMIN\") {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: \"Forbidden\"\n        }, {\n            status: 403\n        });\n    }\n    try {\n        const body = await req.json();\n        const businessName = String(body?.businessName ?? \"\").trim();\n        const lat = Number(body?.lat);\n        const lng = Number(body?.lng);\n        if (!businessName) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                message: \"Mess name is required\"\n            }, {\n                status: 400\n            });\n        }\n        if (!isValidCoordinate(lat, lng)) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                message: \"Valid latitude and longitude are required\"\n            }, {\n                status: 400\n            });\n        }\n        const current = await (0,_lib_system__WEBPACK_IMPORTED_MODULE_1__.getSystemSettings)();\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.systemSettings.upsert({\n            where: {\n                id: \"default\"\n            },\n            update: {\n                businessName,\n                lat,\n                lng\n            },\n            create: {\n                id: \"default\",\n                businessName,\n                shortName: current.shortName,\n                phone: current.phone,\n                supportEmail: current.supportEmail,\n                address: current.address,\n                city: current.city,\n                heroImageUrl: current.heroImageUrl,\n                lat,\n                lng\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            businessName,\n            lat,\n            lng\n        });\n    } catch (e) {\n        console.error(e);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: \"Server error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3N5c3RlbS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBMkM7QUFDTTtBQUNIO0FBQ1I7QUFFL0IsZUFBZUk7SUFDcEIsTUFBTUMsV0FBVyxNQUFNSiw4REFBaUJBO0lBQ3hDLE9BQU9ELHFEQUFZQSxDQUFDTSxJQUFJLENBQUNEO0FBQzNCO0FBRUEsTUFBTUUsb0JBQW9CLENBQUNDLEtBQWFDLE1BQ3RDQyxPQUFPQyxRQUFRLENBQUNILFFBQ2hCRSxPQUFPQyxRQUFRLENBQUNGLFFBQ2hCRCxPQUFPLENBQUMsTUFDUkEsT0FBTyxNQUNQQyxPQUFPLENBQUMsT0FDUkEsT0FBTztBQUVGLGVBQWVHLElBQUlDLEdBQVk7SUFDcEMsTUFBTUMsUUFBUSxNQUFNWiwyREFBWUEsQ0FBQ1c7SUFDakMsSUFBSUMsT0FBT0MsU0FBUyxTQUFTO1FBQzNCLE9BQU9mLHFEQUFZQSxDQUFDTSxJQUFJLENBQUM7WUFBRVUsU0FBUztRQUFZLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQ25FO0lBQ0EsSUFBSTtRQUNGLE1BQU1DLE9BQU8sTUFBTUwsSUFBSVAsSUFBSTtRQUMzQixNQUFNYSxlQUFlQyxPQUFPRixNQUFNQyxnQkFBZ0IsSUFBSUUsSUFBSTtRQUMxRCxNQUFNYixNQUFNRSxPQUFPUSxNQUFNVjtRQUN6QixNQUFNQyxNQUFNQyxPQUFPUSxNQUFNVDtRQUN6QixJQUFJLENBQUNVLGNBQWM7WUFDakIsT0FBT25CLHFEQUFZQSxDQUFDTSxJQUFJLENBQ3RCO2dCQUFFVSxTQUFTO1lBQXdCLEdBQ25DO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFDQSxJQUFJLENBQUNWLGtCQUFrQkMsS0FBS0MsTUFBTTtZQUNoQyxPQUFPVCxxREFBWUEsQ0FBQ00sSUFBSSxDQUN0QjtnQkFBRVUsU0FBUztZQUE0QyxHQUN2RDtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsTUFBTUssVUFBVSxNQUFNckIsOERBQWlCQTtRQUN2QyxNQUFNRSwrQ0FBTUEsQ0FBQ29CLGNBQWMsQ0FBQ0MsTUFBTSxDQUFDO1lBQ2pDQyxPQUFPO2dCQUFFQyxJQUFJO1lBQVU7WUFDdkJDLFFBQVE7Z0JBQUVSO2dCQUFjWDtnQkFBS0M7WUFBSTtZQUNqQ21CLFFBQVE7Z0JBQ05GLElBQUk7Z0JBQ0pQO2dCQUNBVSxXQUFXUCxRQUFRTyxTQUFTO2dCQUM1QkMsT0FBT1IsUUFBUVEsS0FBSztnQkFDcEJDLGNBQWNULFFBQVFTLFlBQVk7Z0JBQ2xDQyxTQUFTVixRQUFRVSxPQUFPO2dCQUN4QkMsTUFBTVgsUUFBUVcsSUFBSTtnQkFDbEJDLGNBQWNaLFFBQVFZLFlBQVk7Z0JBQ2xDMUI7Z0JBQ0FDO1lBQ0Y7UUFDRjtRQUNBLE9BQU9ULHFEQUFZQSxDQUFDTSxJQUFJLENBQUM7WUFBRTZCLFNBQVM7WUFBTWhCO1lBQWNYO1lBQUtDO1FBQUk7SUFDbkUsRUFBRSxPQUFPMkIsR0FBRztRQUNWQyxRQUFRQyxLQUFLLENBQUNGO1FBQ2QsT0FBT3BDLHFEQUFZQSxDQUFDTSxJQUFJLENBQUM7WUFBRVUsU0FBUztRQUFlLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQ3RFO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tZXNzLW1hbmFnZW1lbnQtc3lzdGVtLy4vYXBwL2FwaS9zeXN0ZW0vcm91dGUudHM/ZDE4YyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcbmltcG9ydCB7IGdldFN5c3RlbVNldHRpbmdzIH0gZnJvbSBcIkAvbGliL3N5c3RlbVwiO1xuaW1wb3J0IHsgZ2V0QXV0aFRva2VuIH0gZnJvbSBcIkAvbGliL2dldFRva2VuXCI7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9saWIvcHJpc21hXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0U3lzdGVtU2V0dGluZ3MoKTtcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHNldHRpbmdzKTtcbn1cblxuY29uc3QgaXNWYWxpZENvb3JkaW5hdGUgPSAobGF0OiBudW1iZXIsIGxuZzogbnVtYmVyKSA9PlxuICBOdW1iZXIuaXNGaW5pdGUobGF0KSAmJlxuICBOdW1iZXIuaXNGaW5pdGUobG5nKSAmJlxuICBsYXQgPj0gLTkwICYmXG4gIGxhdCA8PSA5MCAmJlxuICBsbmcgPj0gLTE4MCAmJlxuICBsbmcgPD0gMTgwO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUFVUKHJlcTogUmVxdWVzdCkge1xuICBjb25zdCB0b2tlbiA9IGF3YWl0IGdldEF1dGhUb2tlbihyZXEpO1xuICBpZiAodG9rZW4/LnJvbGUgIT09IFwiQURNSU5cIikge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IG1lc3NhZ2U6IFwiRm9yYmlkZGVuXCIgfSwgeyBzdGF0dXM6IDQwMyB9KTtcbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCByZXEuanNvbigpO1xuICAgIGNvbnN0IGJ1c2luZXNzTmFtZSA9IFN0cmluZyhib2R5Py5idXNpbmVzc05hbWUgPz8gXCJcIikudHJpbSgpO1xuICAgIGNvbnN0IGxhdCA9IE51bWJlcihib2R5Py5sYXQpO1xuICAgIGNvbnN0IGxuZyA9IE51bWJlcihib2R5Py5sbmcpO1xuICAgIGlmICghYnVzaW5lc3NOYW1lKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgbWVzc2FnZTogXCJNZXNzIG5hbWUgaXMgcmVxdWlyZWRcIiB9LFxuICAgICAgICB7IHN0YXR1czogNDAwIH1cbiAgICAgICk7XG4gICAgfVxuICAgIGlmICghaXNWYWxpZENvb3JkaW5hdGUobGF0LCBsbmcpKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgbWVzc2FnZTogXCJWYWxpZCBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIGFyZSByZXF1aXJlZFwiIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDAgfVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZ2V0U3lzdGVtU2V0dGluZ3MoKTtcbiAgICBhd2FpdCBwcmlzbWEuc3lzdGVtU2V0dGluZ3MudXBzZXJ0KHtcbiAgICAgIHdoZXJlOiB7IGlkOiBcImRlZmF1bHRcIiB9LFxuICAgICAgdXBkYXRlOiB7IGJ1c2luZXNzTmFtZSwgbGF0LCBsbmcgfSxcbiAgICAgIGNyZWF0ZToge1xuICAgICAgICBpZDogXCJkZWZhdWx0XCIsXG4gICAgICAgIGJ1c2luZXNzTmFtZSxcbiAgICAgICAgc2hvcnROYW1lOiBjdXJyZW50LnNob3J0TmFtZSxcbiAgICAgICAgcGhvbmU6IGN1cnJlbnQucGhvbmUsXG4gICAgICAgIHN1cHBvcnRFbWFpbDogY3VycmVudC5zdXBwb3J0RW1haWwsXG4gICAgICAgIGFkZHJlc3M6IGN1cnJlbnQuYWRkcmVzcyxcbiAgICAgICAgY2l0eTogY3VycmVudC5jaXR5LFxuICAgICAgICBoZXJvSW1hZ2VVcmw6IGN1cnJlbnQuaGVyb0ltYWdlVXJsLFxuICAgICAgICBsYXQsXG4gICAgICAgIGxuZyxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogdHJ1ZSwgYnVzaW5lc3NOYW1lLCBsYXQsIGxuZyB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgbWVzc2FnZTogXCJTZXJ2ZXIgZXJyb3JcIiB9LCB7IHN0YXR1czogNTAwIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U3lzdGVtU2V0dGluZ3MiLCJnZXRBdXRoVG9rZW4iLCJwcmlzbWEiLCJHRVQiLCJzZXR0aW5ncyIsImpzb24iLCJpc1ZhbGlkQ29vcmRpbmF0ZSIsImxhdCIsImxuZyIsIk51bWJlciIsImlzRmluaXRlIiwiUFVUIiwicmVxIiwidG9rZW4iLCJyb2xlIiwibWVzc2FnZSIsInN0YXR1cyIsImJvZHkiLCJidXNpbmVzc05hbWUiLCJTdHJpbmciLCJ0cmltIiwiY3VycmVudCIsInN5c3RlbVNldHRpbmdzIiwidXBzZXJ0Iiwid2hlcmUiLCJpZCIsInVwZGF0ZSIsImNyZWF0ZSIsInNob3J0TmFtZSIsInBob25lIiwic3VwcG9ydEVtYWlsIiwiYWRkcmVzcyIsImNpdHkiLCJoZXJvSW1hZ2VVcmwiLCJzdWNjZXNzIiwiZSIsImNvbnNvbGUiLCJlcnJvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/system/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/getToken.ts":
/*!*************************!*\
  !*** ./lib/getToken.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getAuthToken: () => (/* binding */ getAuthToken)\n/* harmony export */ });\n/* harmony import */ var next_auth_jwt__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/jwt */ \"(rsc)/./node_modules/next-auth/jwt/index.js\");\n/* harmony import */ var next_auth_jwt__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth_jwt__WEBPACK_IMPORTED_MODULE_0__);\n\nasync function getAuthToken(req) {\n    return (0,next_auth_jwt__WEBPACK_IMPORTED_MODULE_0__.getToken)({\n        req: req\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZ2V0VG9rZW4udHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQXlDO0FBRWxDLGVBQWVDLGFBQWFDLEdBQVk7SUFDN0MsT0FBT0YsdURBQVFBLENBQUM7UUFBRUUsS0FBS0E7SUFBYTtBQUN0QyIsInNvdXJjZXMiOlsid2VicGFjazovL21lc3MtbWFuYWdlbWVudC1zeXN0ZW0vLi9saWIvZ2V0VG9rZW4udHM/NDIyNiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRUb2tlbiB9IGZyb20gXCJuZXh0LWF1dGgvand0XCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXV0aFRva2VuKHJlcTogUmVxdWVzdCkge1xyXG4gIHJldHVybiBnZXRUb2tlbih7IHJlcTogcmVxIGFzIG5ldmVyIH0pO1xyXG59XHJcbiJdLCJuYW1lcyI6WyJnZXRUb2tlbiIsImdldEF1dGhUb2tlbiIsInJlcSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/getToken.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log:  true ? [\n        \"query\",\n        \"error\",\n        \"warn\"\n    ] : 0\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QztBQUU5QyxNQUFNQyxrQkFBa0JDO0FBRWpCLE1BQU1DLFNBQ1hGLGdCQUFnQkUsTUFBTSxJQUN0QixJQUFJSCx3REFBWUEsQ0FBQztJQUNmSSxLQUFLQyxLQUFzQyxHQUFHO1FBQUM7UUFBUztRQUFTO0tBQU8sR0FBRyxDQUFTO0FBQ3RGLEdBQUc7QUFFTCxJQUFJQSxJQUFxQyxFQUFFSixnQkFBZ0JFLE1BQU0sR0FBR0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tZXNzLW1hbmFnZW1lbnQtc3lzdGVtLy4vbGliL3ByaXNtYS50cz85ODIyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gXCJAcHJpc21hL2NsaWVudFwiO1xyXG5cclxuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHsgcHJpc21hOiBQcmlzbWFDbGllbnQgfTtcclxuXHJcbmV4cG9ydCBjb25zdCBwcmlzbWEgPVxyXG4gIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPz9cclxuICBuZXcgUHJpc21hQ2xpZW50KHtcclxuICAgIGxvZzogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIiA/IFtcInF1ZXJ5XCIsIFwiZXJyb3JcIiwgXCJ3YXJuXCJdIDogW1wiZXJyb3JcIl0sXHJcbiAgfSk7XHJcblxyXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID0gcHJpc21hO1xyXG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsVGhpcyIsInByaXNtYSIsImxvZyIsInByb2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./lib/system.ts":
/*!***********************!*\
  !*** ./lib/system.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSystemSettings: () => (/* binding */ getSystemSettings)\n/* harmony export */ });\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\nconst DEFAULT_SETTINGS = {\n    businessName: process.env.MESS_BUSINESS_NAME || \"Mess Management System\",\n    shortName: process.env.MESS_SHORT_NAME || \"MESS\",\n    phone: process.env.MESS_PHONE || \"\",\n    supportEmail: process.env.MESS_SUPPORT_EMAIL || null,\n    address: process.env.MESS_ADDRESS || \"\",\n    city: process.env.MESS_CITY || \"\",\n    lat: Number(process.env.MESS_LAT || 0),\n    lng: Number(process.env.MESS_LNG || 0),\n    heroImageUrl: process.env.MESS_HERO_IMAGE_URL || null\n};\nasync function getSystemSettings() {\n    try {\n        const settings = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.systemSettings.findUnique({\n            where: {\n                id: \"default\"\n            }\n        });\n        if (!settings) {\n            return DEFAULT_SETTINGS;\n        }\n        return {\n            businessName: settings.businessName,\n            shortName: settings.shortName,\n            phone: settings.phone,\n            supportEmail: settings.supportEmail,\n            address: settings.address,\n            city: settings.city,\n            lat: settings.lat,\n            lng: settings.lng,\n            heroImageUrl: settings.heroImageUrl\n        };\n    } catch  {\n        return DEFAULT_SETTINGS;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3lzdGVtLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQXNDO0FBY3RDLE1BQU1DLG1CQUF1QztJQUMzQ0MsY0FBY0MsUUFBUUMsR0FBRyxDQUFDQyxrQkFBa0IsSUFBSTtJQUNoREMsV0FBV0gsUUFBUUMsR0FBRyxDQUFDRyxlQUFlLElBQUk7SUFDMUNDLE9BQU9MLFFBQVFDLEdBQUcsQ0FBQ0ssVUFBVSxJQUFJO0lBQ2pDQyxjQUFjUCxRQUFRQyxHQUFHLENBQUNPLGtCQUFrQixJQUFJO0lBQ2hEQyxTQUFTVCxRQUFRQyxHQUFHLENBQUNTLFlBQVksSUFBSTtJQUNyQ0MsTUFBTVgsUUFBUUMsR0FBRyxDQUFDVyxTQUFTLElBQUk7SUFDL0JDLEtBQUtDLE9BQU9kLFFBQVFDLEdBQUcsQ0FBQ2MsUUFBUSxJQUFJO0lBQ3BDQyxLQUFLRixPQUFPZCxRQUFRQyxHQUFHLENBQUNnQixRQUFRLElBQUk7SUFDcENDLGNBQWNsQixRQUFRQyxHQUFHLENBQUNrQixtQkFBbUIsSUFBSTtBQUNuRDtBQUVPLGVBQWVDO0lBQ3BCLElBQUk7UUFDRixNQUFNQyxXQUFXLE1BQU14QiwrQ0FBTUEsQ0FBQ3lCLGNBQWMsQ0FBQ0MsVUFBVSxDQUFDO1lBQ3REQyxPQUFPO2dCQUFFQyxJQUFJO1lBQVU7UUFDekI7UUFDQSxJQUFJLENBQUNKLFVBQVU7WUFDYixPQUFPdkI7UUFDVDtRQUNBLE9BQU87WUFDTEMsY0FBY3NCLFNBQVN0QixZQUFZO1lBQ25DSSxXQUFXa0IsU0FBU2xCLFNBQVM7WUFDN0JFLE9BQU9nQixTQUFTaEIsS0FBSztZQUNyQkUsY0FBY2MsU0FBU2QsWUFBWTtZQUNuQ0UsU0FBU1ksU0FBU1osT0FBTztZQUN6QkUsTUFBTVUsU0FBU1YsSUFBSTtZQUNuQkUsS0FBS1EsU0FBU1IsR0FBRztZQUNqQkcsS0FBS0ssU0FBU0wsR0FBRztZQUNqQkUsY0FBY0csU0FBU0gsWUFBWTtRQUNyQztJQUNGLEVBQUUsT0FBTTtRQUNOLE9BQU9wQjtJQUNUO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tZXNzLW1hbmFnZW1lbnQtc3lzdGVtLy4vbGliL3N5c3RlbS50cz9jZTdiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByaXNtYSB9IGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcblxuZXhwb3J0IHR5cGUgU3lzdGVtU2V0dGluZ3NEYXRhID0ge1xuICBidXNpbmVzc05hbWU6IHN0cmluZztcbiAgc2hvcnROYW1lOiBzdHJpbmc7XG4gIHBob25lOiBzdHJpbmc7XG4gIHN1cHBvcnRFbWFpbDogc3RyaW5nIHwgbnVsbDtcbiAgYWRkcmVzczogc3RyaW5nO1xuICBjaXR5OiBzdHJpbmc7XG4gIGxhdDogbnVtYmVyO1xuICBsbmc6IG51bWJlcjtcbiAgaGVyb0ltYWdlVXJsOiBzdHJpbmcgfCBudWxsO1xufTtcblxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogU3lzdGVtU2V0dGluZ3NEYXRhID0ge1xuICBidXNpbmVzc05hbWU6IHByb2Nlc3MuZW52Lk1FU1NfQlVTSU5FU1NfTkFNRSB8fCBcIk1lc3MgTWFuYWdlbWVudCBTeXN0ZW1cIixcbiAgc2hvcnROYW1lOiBwcm9jZXNzLmVudi5NRVNTX1NIT1JUX05BTUUgfHwgXCJNRVNTXCIsXG4gIHBob25lOiBwcm9jZXNzLmVudi5NRVNTX1BIT05FIHx8IFwiXCIsXG4gIHN1cHBvcnRFbWFpbDogcHJvY2Vzcy5lbnYuTUVTU19TVVBQT1JUX0VNQUlMIHx8IG51bGwsXG4gIGFkZHJlc3M6IHByb2Nlc3MuZW52Lk1FU1NfQUREUkVTUyB8fCBcIlwiLFxuICBjaXR5OiBwcm9jZXNzLmVudi5NRVNTX0NJVFkgfHwgXCJcIixcbiAgbGF0OiBOdW1iZXIocHJvY2Vzcy5lbnYuTUVTU19MQVQgfHwgMCksXG4gIGxuZzogTnVtYmVyKHByb2Nlc3MuZW52Lk1FU1NfTE5HIHx8IDApLFxuICBoZXJvSW1hZ2VVcmw6IHByb2Nlc3MuZW52Lk1FU1NfSEVST19JTUFHRV9VUkwgfHwgbnVsbCxcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTeXN0ZW1TZXR0aW5ncygpOiBQcm9taXNlPFN5c3RlbVNldHRpbmdzRGF0YT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgcHJpc21hLnN5c3RlbVNldHRpbmdzLmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IFwiZGVmYXVsdFwiIH0sXG4gICAgfSk7XG4gICAgaWYgKCFzZXR0aW5ncykge1xuICAgICAgcmV0dXJuIERFRkFVTFRfU0VUVElOR1M7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBidXNpbmVzc05hbWU6IHNldHRpbmdzLmJ1c2luZXNzTmFtZSxcbiAgICAgIHNob3J0TmFtZTogc2V0dGluZ3Muc2hvcnROYW1lLFxuICAgICAgcGhvbmU6IHNldHRpbmdzLnBob25lLFxuICAgICAgc3VwcG9ydEVtYWlsOiBzZXR0aW5ncy5zdXBwb3J0RW1haWwsXG4gICAgICBhZGRyZXNzOiBzZXR0aW5ncy5hZGRyZXNzLFxuICAgICAgY2l0eTogc2V0dGluZ3MuY2l0eSxcbiAgICAgIGxhdDogc2V0dGluZ3MubGF0LFxuICAgICAgbG5nOiBzZXR0aW5ncy5sbmcsXG4gICAgICBoZXJvSW1hZ2VVcmw6IHNldHRpbmdzLmhlcm9JbWFnZVVybCxcbiAgICB9O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gREVGQVVMVF9TRVRUSU5HUztcbiAgfVxufVxuIl0sIm5hbWVzIjpbInByaXNtYSIsIkRFRkFVTFRfU0VUVElOR1MiLCJidXNpbmVzc05hbWUiLCJwcm9jZXNzIiwiZW52IiwiTUVTU19CVVNJTkVTU19OQU1FIiwic2hvcnROYW1lIiwiTUVTU19TSE9SVF9OQU1FIiwicGhvbmUiLCJNRVNTX1BIT05FIiwic3VwcG9ydEVtYWlsIiwiTUVTU19TVVBQT1JUX0VNQUlMIiwiYWRkcmVzcyIsIk1FU1NfQUREUkVTUyIsImNpdHkiLCJNRVNTX0NJVFkiLCJsYXQiLCJOdW1iZXIiLCJNRVNTX0xBVCIsImxuZyIsIk1FU1NfTE5HIiwiaGVyb0ltYWdlVXJsIiwiTUVTU19IRVJPX0lNQUdFX1VSTCIsImdldFN5c3RlbVNldHRpbmdzIiwic2V0dGluZ3MiLCJzeXN0ZW1TZXR0aW5ncyIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsImlkIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/system.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/uuid","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsystem%2Froute&page=%2Fapi%2Fsystem%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsystem%2Froute.ts&appDir=C%3A%5CUsers%5Cajmal%5CDesktop%5Ctouchpointe%5Cmess%20management%20system%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cajmal%5CDesktop%5Ctouchpointe%5Cmess%20management%20system&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();