<template>
    <view class="content">
        <image class="logo" src="../../static/logo.png"></image>
        <view>
            <text class="title">{{ title }}</text>
        </view>
    </view>
</template>

<script lang="ts">
    import {
        defineComponent
    } from "vue";
    export default defineComponent({
        setup() {
            return {
                title: "hello",
            };
        },
    });
</script>

<style>
    .content {
        text-align: center;
        height: 400upx;
    }

    .logo {
        height: 200upx;
        width: 200upx;
        margin-top: 200upx;
    }

    .title {
        font-size: 36upx;
        color: #8f8f94;
    }
</style>
