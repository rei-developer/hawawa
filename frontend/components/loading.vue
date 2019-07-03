<template>
  <div class='Layer'>
    <div class='spinner'>
      <div class='bounce1' />
      <div class='bounce2' />
      <div class='bounce3' />
    </div>
  </div>
</template>

<style>
  .Layer {
    position: absolute;
    top: 40%;
    left: 50%;
    width: 70px;
    height: 18px;
    margin: -35px 0 0 -9px;
  }

  .spinner {
    position: fixed;
    margin: 100px auto 0;
    width: 70px;
    height: 18px;
    text-align: center;
    z-index: 10000;
  }

  .spinner > div {
    width: 18px;
    height: 18px;
    background-color: #29313D;
    border-radius: 100%;
    display: inline-block;
    -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  }

  .spinner .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }

  .spinner .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }

  @-webkit-keyframes sk-bouncedelay {
    0%, 80%, 100% { -webkit-transform: scale(0) }
    40% { -webkit-transform: scale(1.0) }
  }

  @keyframes sk-bouncedelay {
    0%, 80%, 100% { 
      -webkit-transform: scale(0);
      transform: scale(0);
    } 40% { 
      -webkit-transform: scale(1.0);
      transform: scale(1.0);
    }
  }
</style>