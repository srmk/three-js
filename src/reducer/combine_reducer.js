import { combineReducers } from 'redux';
import dynamicStore from './reducer';

const rootReducer = (history) => combineReducers({
    dynamicStore
});

export default rootReducer;