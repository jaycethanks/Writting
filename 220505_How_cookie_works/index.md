[toc]

## How does cookie works?

As we know that a cookie is a small and non-edible plain text file. It is stored in the browse, to be more precise, stored in the client side local. It simply contains a small amount of data. ([location of cookie](https://www.digitalcitizen.life/cookies-location-windows-10/))

The data in the cookie is sent over by the server, and It will be used in subsequent requests as an identifier of sorts. Cookies are mainly used to remember state(log in state, shopping cart items, user preferences etc.)

### How cookie be setted ?

Cookies are created when the server sends over one or more `Set-Cookie` headers with its response:

```http
Set-Cookie: NAME=VALUE
```

It could be any name-value pair, but each cookie can contain only 1 name-value pair. If you need more than 1 cookie, then multiple `Set-Cookie` headers are needed, like :

```http
HTTP/2.0 200 OK
Content-Type: text/html
Set-Cookie: viola=red_panda
Set-Cookie: mathia=polar_bear
```

Once the cookie is set, all subsequent requests to the server next will also have the cookies in its request header.

```http
GET /subsequnt/example/ HTTP/2
Host: example.com
Cookie: viola=red_panda; mathia=polar_bear
```

Even though cookies are usually created on the server, you cao also create them on the client-side with JavaScript, using `document.cookie`.

Browser cookies also have a number of attributes in addition to the name-value pair mentioned earliler.

### Cookie attributes
Adding special prefixes to the cookie name also forces execute certain requirements.
- If your cookie name starts with `__Secure-` : it must be set with the `secure` flag from a page served with `HTTPS`.
- If your cookie name starts with `__Host-` : it must be set with the `secure` flag from a page served with `HTTPS`, and must not have a domain specified and its path must be `/`.

The rest of the attributes are optional but can impact cookie behaviour signigicantly depending on what values are set.

- **`Expires=<date>`** : When a cookie passes its expiry date, it will no longer be sent with browser requests, and instead will be deleted. The date value is a HTTP timestamp.
- **`Max-Age=<number>`** : Also related to a cookie's expiry, but in seconds. After the specified amount of time, the cookie will expire, so setting it to 0 or negative number means instant expiry. `Max-Age` takes precedence over `Expires` is both are set.
- **`Domain=<domain-value`** : Specifies the host where the browser cookie gets sent to. Only a single domain is allowed. If not present, this defaults to the current document URL's host. When specified, all sub-domains are included as well.
- **`Path=<path-value>`** : Cookie will only be sent if the path exists in the current URL.
- **`Secure`** : Cookie will only be sent when the request is made with HTTPS.
- **`HttpOnly`** : JavaScript cannot access the cookie through `document.cookie` (to mitigate XSS attacks)
- **`SameSite=<samesite-value>`** : Specifies if a cookie is sent with cross-origin-request.
  - `Strict` : means the cookie is only sent for requests originating from the same URL as the current one.
  - `Lax` : means the cookie is not sent on cross-site requests, bull will be sent if the user navigates to the origin site from an external site.
  - `None` : means the cookie will be sent on both samesite and cross-site requests, but can only be used if the `Secure` attribute is also set.


### Set and Get rid of cookie

To create a new cookie, you can do something like this :

```javascript
document.cookie = "example=hello_cookie"
```

If you want more, you can do this repeatly.

To reset cookie, or get rid of cookie, you can set it expire attribute:
```javascript
documen.cookie = "example=hello;expires=Thu, 01 Jan 1970 00:00:00 GMT"
```

