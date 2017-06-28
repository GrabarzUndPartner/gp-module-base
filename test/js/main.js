"use strict";

import './webpackPublicPath';
import 'jquery/../event';
import 'jquery/../event/trigger';
import 'jquery/../data';
import 'modernizr-loader!modernizr';
import js from 'gp-module-parser';
import packages from './packages';

js.parse(null, packages);
