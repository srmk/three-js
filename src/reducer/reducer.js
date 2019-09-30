import { DYNAMIC_UPDATE } from '../action/actions';


export default function updateReducer(state = {}, actions) {
    let newstate = state;
    const { type, payload } = actions;

    switch (type) {
        case DYNAMIC_UPDATE:
            return newstate = { ...newstate, ...payload };
        default:
            return newstate;
    }
}