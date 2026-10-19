import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import ts from 'typescript';
const compiled=ts.transpileModule(readFileSync('src/components/windows/state.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const ids=['about','work','resume','contact'];const module={exports:{}};
new Function('require','exports',compiled)(()=>({windowIds:ids,windowRegistry:Object.fromEntries(ids.map(id=>[id,{canMaximize:id!=='contact'}]))}),module.exports);
const {initialWindowState,windowReducer}=module.exports;let state=initialWindowState();let token=0;
function act(type,id='about',extra={}){state=windowReducer(state,type==='settle'?{type,id,token:state.windows[id].transitionId,...extra}:{type,id,token:++token,...extra});}
for(const id of ids){act('open',id);act('settle',id);}assert.equal(state.order.length,4);assert.equal(state.activeId,'contact');act('focus','about');assert.equal(state.order.at(-1),'about');act('close','work');const closingToken=state.windows.work.transitionId;act('settle','work',{token:closingToken-1});assert.equal(state.windows.work.visibilityState,'closing');act('settle','work');assert.equal(state.order.length,3);assert.equal(state.activeId,'about');
act('position','about',{position:{x:70,y:20}});act('maximize','about');act('settle');assert.equal(state.windows.about.sizeMode,'maximized');act('unmaximize');act('settle');assert.deepEqual(state.windows.about.position,{x:70,y:20});
act('maximize','contact');assert.equal(state.windows.contact.sizeMode,'normal');act('close');act('settle');assert.equal(state.activeId,'contact');act('open','work',{exclusive:true});act('settle','work');assert.deepEqual(state.order,['work']);act('open','about');act('settle');act('compact');assert.deepEqual(state.order,['about']);
assert.ok(!('minimizedOrder'in state));assert.ok(!('previousSizeMode'in state.windows.about));console.log('Passed desktop multiwindow ordering, close isolation, stale completion, saved geometry, Contact guard and exclusive mobile state.');
