## 递增（增量）轮询

我们平常开发中，经常用到，轮询。但是有些场景下， 对某些轮询有一些额外的要求。 例如我现在公司在做的项目中，后台有队列任务，如果队列任务少，或者空闲的话，那么这个任务很快就能够完成， 否则，就需要排队。 

那么一开始，前台发送了一个任务执行请求的时候，接着前台这边会开始轮询这个任务的执行状态，完成了没有。设定的轮询时间是5秒。 

但是前台的反馈就会有一个问题，哪怕这个任务在1秒钟就完成了。 前台也不会变更状态，只有等5秒后的下一次请求，然后再变更页面状态。 

我们这个业务暂时没有用到 socket， 所以实时性没有那么高。 



那有没有别的思路呢？ 

如果我直接将间隔时间调整为很短，这样页面确实可以较快响应任务的状态变更。 但是如果任务很多的时候，后台压力会很大。 



是否可以假设，前台每次请求执行一个任务后，我先是间隔很短的去轮询，如果后台队列比较空闲，那么很快就能更新状态了， 然后我慢慢的递增间隔的轮询时间，直到一个设定的最大值。 

假设，我起始最少间隔是200毫秒，然后递增步长是100毫秒，最大间隔是1500毫秒。

现在如果有一个任务请求执行需要1秒，那么我会分别以以下间隔发送请求：

```bash
200ms,200ms+100ms,200ms+100ms+100ms,200ms+100ms+100ms+100ms
```

四次请求的总时长为 1400ms, 所以我在第四次请求就能够更新页面状态了，

而如果某个任务请求执行需要10分钟，那么前台会一次累加请求的间隔时间，200ms,300ms,400ms,500ms,.....直到1500ms, 此时如果状态还没有完成，那么后面就每隔1500ms去查询一次。 



### 实现

根据以上思路，我们有如下实现：

```ts
/**
 * 
 * @param min 起始间隔
 * @param max 最大延迟
 * @param step 步进延迟
 * @param cb 回调函数(执行函数)
 * @param immediate 是否立即执行
 * @param _count (私有属性，也可以传递，传递后首次延迟将会是 min + step * _count)
 */
const incrementWalk = function (min: number, max: number, step: number, cb: () => void, immediate = false, _count = 0) {
    immediate && cb();
    // console.time()
    const nextDelay = min + step * _count
    setTimeout(() => {
        // console.timeEnd()
        incrementWalk(min, max, step, cb, immediate, _count + 1)
    }, nextDelay > max ? max : nextDelay)
}

const callback = () => {
    console.log("trigger")
}

incrementWalk(100, 5000, 300, callback, true)
```



### 递增（增量）轮询，解决了什么问题？

解决了在某个任务耗时不确定，又希望尽快刷新页面状态，同时又要兼顾服务器压力问题。 







## 阶梯轮询

解决了上一个问题后，我在想， 有没有一种情况， 可以指定前几次请求延时分别不同。 例如， 前10次间隔500ms, 从第10次开始，到第20次结束， 中间每次请求间隔1000ms, 类似这种， 然后按照某个固定间隔轮询？

所以有了如下实现：

```ts
/**
 * 
 * @param tieredArray 二维数组，其数据组成为 Array<[delay时间,次数]>
 * @param constantDelay 固定间隔时间，也就是指定间隔走完了，后面的固定间隔延时
 * @param cb 回调函数(待执行函数)
 */
async function tieredWalk(tieredArray: number[][], constantDelay: number, cb: () => void) {
    for (let i = 0; i < tieredArray.length; i++) {
        const [delay, times] = tieredArray[i]
        await new Promise<void>((resolve, reject) => {
            function innerWalker(times: number) {
                setTimeout(() => {
                    try {
                        cb()
                    } catch (err) {
                        reject(err)
                    }
                    times--
                    if (times > 0) {
                        innerWalker(times)
                    } else {
                        resolve()
                    }
                }, delay)
            }
            innerWalker(times)
        })

    }

    outerWalker()
    function outerWalker() {
        cb()
        setTimeout(() => {
            console.log("outer")
            outerWalker()
        }, constantDelay)
    }

}

let a = 0
const cb = function () {
    a++
    if(a > 5) return;
    console.log('trigger')
}
tieredWalk([[1000, 3], [200, 2], [2000, 2], [400, 3]], 1000, cb)
```

这段代码，