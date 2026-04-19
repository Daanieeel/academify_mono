import { Redirect } from "expo-router";
import React from "react";

const Index = () => {
  return <Redirect href={"/(auth)/landing-page/landing-page"}></Redirect>;
};

export default Index;
