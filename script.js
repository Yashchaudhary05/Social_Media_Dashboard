"use strict";
var darkButton = document.getElementById("dark"),
    lightButton = document.getElementById("light"),
    setDarkMode = function () {
        (document.querySelector("body").classList = "dark"), localStorage.setItem("colorMode", "dark");
    },
    setLightMode = function () {
        (document.querySelector("body").classList = "light"), localStorage.setItem("colorMode", "light");
    },
    colorModeFromLocalStorage = function () {
        return localStorage.getItem("colorMode");
    },
    colorModeFromPreferences = function () {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    },
    loadAndUpdateColor = function () {
        "dark" == (colorModeFromLocalStorage() || colorModeFromPreferences()) ? darkButton.click() : lightButton.click();
    },
    radioButtons = document.querySelectorAll(".toggle__wrapper input");
radioButtons.forEach(function (e) {
    e.addEventListener("click", function (e) {
        darkButton.checked ? setDarkMode() : setLightMode();
    });
}),
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        e.matches ? darkButton.click() : lightButton.click();
    }),
    loadAndUpdateColor();
