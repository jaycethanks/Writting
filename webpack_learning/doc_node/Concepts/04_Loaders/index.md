### Loader

loader ���ڶ�ģ���Դ�������ת���� **loader ����ʹ���� `import` ���� ��load�����أ��� ģ��ʱԤ�����ļ���**��ˣ�loader �������������������� ������(task)���� ���ṩ�˴���ǰ�˹�������ĵ�����ʽ��

loader ���Խ��ļ��Ӳ�ͬ������ (�� TypeScript) ת��Ϊ JavaScript ���߽�����ͼ��ת��Ϊ data URL��loader ����������ֱ���� JavaScript ģ���� `import` CSS �ļ���

### ʾ��

���磬�����ʹ�� loader ���� webpack ����  CSS �ļ������߽� TypeScript תΪ JavaScript�� Ϊ�ˣ����Ȱ�װ���Ӧ�� loader :

```bash
npm install --save-dev css-loader ts-loader
```

Ȼ��ָʾ webpack ��ÿ�� `.css` ʹ�� `css-loader` �� �Լ������� `.ts` �ļ�ʹ�� `ts-loader` ��

**webpack.config.js**

```javascript
module.exports = {
    module: {
        rules: [
            { test: /\.css$/, use: 'css-loader' },
            { test: /\.ts$/, use: 'ts-loader' },
        ]
    }
}
```



### ʹ�� loader

�����Ӧ�ó����У� ������ʹ�� loader �ķ�ʽ:

- ���÷�ʽ (�Ƽ�) ��  �� `webpack.config.js` �ļ���ָ��loader�� 
- ������ʽ�� ��ÿ�� `import` �������ʽָ�� loader��

ע�⣬�� webpack4 �汾����ͨ�� CLI ʹ�� loader, ������ webpack v5 �б����á�



####  Configuration

module.rules �������� webpack ������ָ����� loader�� ���ַ�ʽ��չʾ loader ��һ�ּ�����ʽ�� ����������ʹ�����ü�������ά���� ͬʱ����Ը���loader �и�ȫ�ָ�����

**loader ==���ҵ���==�� �����ߴ��ϵ��£���ȡֵ/ִ�� ��#evaluate/execute��** �� �������ʾ���У� �� sass-loader ��ʼִ�У� Ȼ�����ִ�� css-loader�� ����� style-loader Ϊ������ �鿴 [loader ����](https://webpack.docschina.org/concepts/loaders/#loader-features)�½ڣ��˽��й� loader ˳��ĸ�����Ϣ ��

```javascript
module.exports = {
    module: {
        rules: [
            {
                test: /\.(s[a|c]|c)ss$/,
                use: [
                    { loader: 'style-loader' },
                    { 
                        loader: 'css-loader',
                        options: {
                            modules: true
                        }
                    },
                    { loader: 'sass-loader' }
                ]
            }:
        ]
    }
}
```

#### ������ʽ

������ `import` �����κ� [�� `import` ����ͬ�ȵ����÷�ʽ](https://webpack.docschina.org/api/module-methods) ��ָ�� loader�� ʹ�� `!` ����Դ�е� loader �ֿ��� ÿ�����ֶ�������ڵ�ǰĿ¼������ 

```javascript
import Styles from "style-loader!css-loader?modules!./styles.css";
```

ͨ��Ϊ ���� `import` ������ǰ׺������ **��������** �е����� loader, preLoader �� postLoader :

- ʹ�� `!` ǰ׺�� ���������������õ� normal loader (��ͨ loader)
  ```javascript
  import Styles from "!style-loader!css-loader?modules!./styles.css";
  ```

- ʹ�� `!!` ǰ׺�� ���������������õ� `loader` (preLoader, loader, postLoader)
  ```javascript
  import Styles from "!!style-loader!css-loader?modules!./styles.css";
  ```

- ʹ�� `-!`ǰ׺�����������������õ� `preLoader` �� `loader`�� ���ǲ����� `postLoaders`

  ```javascript
  import Styles from '-!style-loader!css-loader?modules!./styles.css';
  ```

**ѡ����Դ��ݲ�ѯ����**�� ���� `?key=value&foo=bar`�� ����һ�� JSON ���� ���� `?{"key":"value","foo":"bar"}`��

> Tip
>
> ������ʹ�� `module.rules` ����Ϊ�������Լ���Դ���������ļ��Ĵ������� ���ҿ����ڳ����ʱ�򣬸���ص��ԺͶ�λ loader �е����⡣ 



#### loader ����

- loader ֧����ʽ���á����е�ÿ�� loader �Ὣת��Ӧ�����Ѵ������Դ�ϡ� һ����ʽ�� loader ���ᰴ���෴��˳��ִ�С� ���еĵ�һ�� loader ������(Ҳ����Ӧ��ת�������Դ�����ݸ���һ��loader,�������ơ�������е����һ�� loader �� ���� webpack �������� JavaScript��
- loader ������ͬ���ģ� Ҳ�������첽�ġ�
- loader ������ Node.js �У� �����ܹ�ִ���κβ����� 
- loader ����ͨ�� `options` �������� ����Ȼ֧��ʹ�� `query` ���������ò���ѡ�**�������ַ�ʽ�Ѿ�������**��
- ���˳����� ͨ�� `package.json` �� `main` ����һ��  npm ģ�鵼��Ϊ loader, �������� module.rules ��ʹ�� `loader` �ֶ�ֱ������һ��ģ�顣
- ���(plugin) ����Ϊ loader �����������ԡ�
- loader �ܹ���������������ļ��� 

����ͨ�� loader ��Ԥ��������Ϊ JavaScript ��̬ϵͳ�ṩ����������� �û����ڿ��Ը�����������ϸ�����߼��� ���磺 ѹ�������������ת/���� �� [������������](https://webpack.docschina.org/loaders)��



### ����  loader

loader ��ѭ��׼ [ģ�����](https://webpack.docschina.org/concepts/module-resolution/) ���� ��������£�loader ���� [ģ��·��](https://webpack.docschina.org/concepts/module-resolution/#module-paths) ���أ�ͨ���Ǵ� `npm install`, `node_modules` ���м��أ���

����Ԥ�� loader ģ�鵼��Ϊһ�����������ұ�дΪ Node.js ���ݵ� JavaScript��ͨ��ʹ�� npm ���й��� loader������Ҳ���Խ�Ӧ�ó����е��ļ���Ϊ�Զ��� loader������Լ����loader ͨ��������Ϊ `xxx-loader`������ `json-loader`����������ϸ��Ϣ����鿴 [��дһ�� loader](https://webpack.docschina.org/contribute/writing-a-loader/)��