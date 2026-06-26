# iPhone 5s Dock

A desk dock that repurposes an old iPhone 5s into a wireless controller for a PC, combining hardware reuse with custom software to create a personalized productivity tool.

# Project Overview

Switching between applications and navigating desktop shortcuts can interrupt workflow, especially when using the same programs repeatedly. While devices like the Elgato Stream Deck solve this problem, they can be expensive and offer limited customization.

This project explores a DIY alternative by transforming an unused iPhone 5s into a smart desktop dock. Connected over the local Wi-Fi network, the phone acts as a touch-based control panel capable of launching applications, displaying useful information, and eventually serving as a small companion display for my desk.


# Goals

## MVP (Minimum Viable Product)

* Display a grid of large, touch-friendly application buttons on the iPhone.
* Send commands over Wi-Fi when a button is pressed.
* Run a lightweight server on the PC that listens for requests and launches the selected application.
* Display simple status feedback on the iPhone, such as whether the application launched successfully or if the connection failed.

## Stretch Goals

* Idle screen with a clock and calendar.
* Custom macros and long-press actions.
* Multiple application profiles (Work, Personal, Gaming, etc.).
* Simplified application management with automatic shortcut detection.
* More polished UI with lower latency.
* Integration with my home lab and personal server.
* Stream a webcam feed to the iPhone so it can double as a desktop monitor (I don't own a webcam, so why not build one?).

---

# Key Features

### Wireless Client–Server Architecture

* Communication between the iPhone and PC over the local Wi-Fi network.
* HTTP request handling for low-latency communication.
* Lightweight server running on the desktop.

### Mobile Interface

Originally, the interface was planned to be built entirely in Flutter. Due to unforeseen circumstances (explained in the development blog), the implementation changed, but the original design goals remained the same: a fast, touch-friendly interface optimized for quick desktop control.

### Desktop Command Server

* Maps incoming requests to desktop applications.
* Launches programs directly from the phone.
* Handles server-side request processing.

### Modular Design

The project is structured so new features—such as macros, widgets, media controls, or system monitoring—can be added without redesigning the entire application.

---

# Motivation & Learning Outcomes

This project was primarily an excuse to learn technologies I hadn't worked with before while giving new life to an old piece of hardware.

Some of the things I learned throughout development include:

* Building client–server applications over a local network.
* Understanding HTTP communication between devices.
* Frontend and backend integration.
* Repurposing old hardware into something genuinely useful.
* Designing software that combines multiple technologies into a single project.

---

# Resources & References

The original inspiration came from programmable desktop controllers such as the **Elgato Stream Deck**.

### Reference

<img width="255" height="270" alt="image (1)" src="https://github.com/user-attachments/assets/9dea86a4-a605-4ad9-aea8-b5949bd48a92" />


### Target Design

<img width="720" height="363" alt="image" src="https://github.com/user-attachments/assets/5568d5f4-af36-4a79-885c-90f60e0c196e" />


Although the final design differs from the original concept, the goal remained the same: create a clean, responsive desktop companion that feels natural to use on an old iPhone.

---

# Learning Resources

Some of the resources that helped throughout development:

* The Odin Project
* Dart Crash Course — Net Ninja
* Flutter Crash Course — Net Ninja
* HTML Tutorial — freeCodeCamp
* HTML & CSS Crash Course — Net Ninja
* Learn CSS Flexbox in 20 Minutes — Coding2GO
* JavaScript Crash Course — Traversy Media
* Git & GitHub Crash Course — Traversy Media

# License
```text
MIT LIcense
```
