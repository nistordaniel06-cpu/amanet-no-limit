(function(root){'use strict';
const round=v=>Math.round((v+Number.EPSILON)*100)/100;
function finiteInRange(value,min,max){if(value===null||value===undefined||typeof value==='boolean'||(typeof value==='string'&&!value.trim()))return null;const n=Number(value);return Number.isFinite(n)&&n>=min&&n<=max?n:null;}
function gold(weight,rate){const g=finiteInRange(weight,.1,10000),r=finiteInRange(rate,.01,1000000);return g===null||r===null?null:round(g*r);}
function loan(amount,days,percent){const a=finiteInRange(amount,100,1000000),d=finiteInRange(days,1,365),p=finiteInRange(percent,0,100);if(a===null||d===null||p===null||!Number.isInteger(d))return null;const commission=round(a*p/100*d);return {principal:a,days:d,percent:p,daily:round(a*p/100),commission,total:round(a+commission)};}
function dueDate(start,days){const d=finiteInRange(days,1,365);if(d===null||!Number.isInteger(d)||!/^\d{4}-\d{2}-\d{2}$/.test(start))return null;const date=new Date(start+'T12:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==start)return null;date.setUTCDate(date.getUTCDate()+d);return date.toISOString().slice(0,10);}
root.AmanetCalc={gold,loan,finiteInRange,dueDate};if(typeof module!=='undefined')module.exports=root.AmanetCalc;
})(typeof window!=='undefined'?window:globalThis);
