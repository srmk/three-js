import React, { Component, Suspense, Fragment } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
// import THREE from "./lib/three";
// import PropTypes from 'prop-types';

import SimulationEntryPoint from "./components/entry_point";

import ErrorBoundary from "./error_boundary/error_boundaries";
import { updateData } from "./action/actions";

type Props = {
  isLoaded: Boolean,
  updateData: () => {}
};

class App extends Component<Props> {
  constructor() {
    super();

    this.container = null;
    this.entryPoint = new SimulationEntryPoint(this.container);
  }

  componentDidMount() {
    this.entryPoint = new SimulationEntryPoint(this.container);
    this.entryPoint.init();
    this.entryPoint.animate();
  }

  // componentWillUnmount() {
  //   if (this.entryPoint) {
  //     this.entryPoint.dispose();
  //   }
  // }

  render() {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Fragment>
            <div
              className={"simulation-container"}
              ref={ele => {
                this.container = ele;
              }}
            />
          </Fragment>
        </Suspense>
      </ErrorBoundary>
    );
  }
}

App.defaultProps = {
  isLoaded: false,
};

const mapStateToProps = ({ dynamicStore }) => {
  const { isLoaded } = dynamicStore;
  return {
    isLoaded
  }
}

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({
    updateData
  }, dispatch),
})


export default connect(mapStateToProps, mapDispatchToProps)(App);