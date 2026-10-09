// Widget registry: data-widget="name" → factory(el, app, slide) returning { enter, step, leave }.
import { REG } from './registry.js';
export const WIDGETS = REG;

const modules = [
  './journey.js', './glyco-widgets.js', './pdh-widgets.js', './tca-widgets.js', './etc-widgets.js', './misc-widgets.js',
];
// all widgets are registered before the deck starts
await Promise.all(modules.map(m => import(m).catch(e => console.error('widget module', m, e))));
