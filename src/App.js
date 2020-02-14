import React from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify, { API, graphqlOperation} from 'aws-amplify';
import awsconfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';
import { listTodos } from './graphql/queries';
import * as XRayHandler from './utils/xray';

Amplify.configure(awsconfig);


class App extends React.Component {

  async componentDidMount() {

  let segment = await XRayHandler.beginSegment();
  let subsegment = await XRayHandler.beginSubsegment(segment, 'listTodos');
  
  Amplify.configure({
    API: {
      graphql_headers: async () => ({
        'X-Amzn-Trace-Id': XRayHandler.getTraceHeader(subsegment)
      })
    }
  });

  await API.graphql(graphqlOperation(listTodos));

  XRayHandler.endSubsegment(subsegment);
  XRayHandler.endSegment(segment);
  console.log(window.performance.getEntriesByName("https://uv4up2dwcfdnbgxx2iqcew5fdu.appsync-api.us-west-2.amazonaws.com/graphql"));
  }

  render () {
    return(
    <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
  </div>
  )}
}


export default withAuthenticator(App, true);