import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		dts({
			// Generates .d.ts files
			staticImport: true,
			insertTypesEntry: true,
		}),
	],
	build: {
		lib: {
			name: 'badger',
			formats: ['es'],
			entry: resolve(__dirname, "src/index.ts"),
			fileName: (format) => `index.${format}.js`
		},
		rollupOptions: {
			external: ['react'],
			output: {
				globals: {
					react: 'React'
				}
			}
		},
	},
	resolve: { alias: { src: resolve("src/") } },
});
