class SrcManifest {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('SrcManifest', (compilation, callback) => {
      const manifest = {}

      for (let filename in compilation.assets) {
        const file_name = filename.split('.')
        const name = file_name[0]
        const ext = file_name[2]
        
        manifest[`${name}.${ext}`] = filename
      }

      compilation.assets['manifest.json'] = {
        source: () => { return JSON.stringify(manifest) },
        //size: () => { return JSON.stringify(manifest).length }
      }

      callback()
    })
  }
}

module.exports = SrcManifest