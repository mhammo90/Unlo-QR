# Project Name: Unlo-QR

## Table of Contents

- [Introduction](#introduction)
- [Project Overview](#project-overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)

## Introduction

Unlo-QR is a project aimed at addressing the challenges posed by excessive and uncontrolled internet use in children. This application offers a solution that combines technology gamification and positive behavior reinforcement to encourage responsible and mindful use of digital devices. By incorporating a points-based reward system, the application empowers parents to set tasks and behaviors for their children, which need to be completed to unlock access to the internet. This approach provides a balance between healthy technology usage and the development of positive habits.

## Project Overview

The project is developed using an agile approach, with a focus on incremental development and continuous feedback. It involves the creation of a user-friendly web application that offers both parents and children interfaces. The parent interface allows parents to set tasks/points allocate points, and monitor their child's progress. On the other hand, the child interface presents tracks points, scan QR codes to complete tasks and enables internet access upon completion of tasks.

## Features

- Parent Interface:

  - Task creation and point allocation
  - Monitoring child's progress
  - Customizable reward thresholds

- Child Interface:
  - Points tracking and accumulation
  - Real-time progress visualization
  - Interactive and engaging design

## Usage

1. change 'example.env' to '.env' and amend the variables if neccessary (uncomment FIREWALL=true to enable full functionality)
2. Run `docker-compose up --build ` to build and run the required docker image
3. a. Access the parent interface at `http://localhost:<userPort>`
   b. Access the child interface at `http://localhost:<adminPort>`

## Technologies Used

- ntfy.sh notifications (https://ntfy.sh)
- Node.js
- Express.js
- ejs Templates
- ipTables
- HTML5, CSS3 and Client Side JS
- Agile methodology
