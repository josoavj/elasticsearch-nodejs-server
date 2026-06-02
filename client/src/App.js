import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

const api = axios.create({
	baseURL: "",
	timeout: 15000,
});

const App = () => {
	const [health, setHealth] = useState(null);
	const [indices, setIndices] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [token, setToken] = useState("");

	const [index, setIndex] = useState("filebeat-*");
	const [query, setQuery] = useState("error");
	const [fields, setFields] = useState("message,source,destination,@timestamp");
	const [mode, setMode] = useState("match");
	const [sortField, setSortField] = useState("@timestamp");
	const [sortOrder, setSortOrder] = useState("desc");

	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(10);
	const [useCursor, setUseCursor] = useState(false);
	const [searchAfter, setSearchAfter] = useState("");
	const [cursorStack, setCursorStack] = useState([]);

	const [results, setResults] = useState([]);
	const [hitsCount, setHitsCount] = useState(0);
	const [nextSearchAfter, setNextSearchAfter] = useState(null);

	useEffect(() => {
		const savedToken = window.localStorage.getItem("authToken") || "";
		setToken(savedToken);
		if (savedToken) {
			api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
		}

		const loadMeta = async () => {
			try {
				const [healthResp, indicesResp] = await Promise.all([
					api.get("/api/health"),
					api.get("/api/indices", { params: { index: "*" } }),
				]);
				setHealth(healthResp.data);
				const rows = indicesResp.data.indices || [];
				setIndices(rows.map((row) => row.index).filter(Boolean));
			} catch (err) {
				setError(err.message || "Failed to load metadata");
			}
		};

		loadMeta();
	}, []);

	const buildParams = ({
		pageOverride,
		perPageOverride,
		searchAfterOverride,
		useCursorOverride,
	} = {}) => {
		const cursorEnabled = useCursorOverride ?? useCursor;
		const params = {
			index,
			q: query,
			fields,
			mode,
			sortField: cursorEnabled ? sortField : undefined,
			sortOrder: cursorEnabled ? sortOrder : undefined,
		};

		if (cursorEnabled) {
			params.searchAfter = searchAfterOverride ?? searchAfter || undefined;
		} else {
			params.page = pageOverride ?? page;
			params.perPage = perPageOverride ?? perPage;
		}

		return params;
	};

	const runSearch = async ({
		resetCursor = false,
		resetPage = false,
		pageOverride,
		perPageOverride,
		searchAfterOverride,
		useCursorOverride,
	} = {}) => {
		setLoading(true);
		setError("");
		try {
			if (resetCursor) {
				setSearchAfter("");
				setCursorStack([]);
			}
			if (resetPage) {
				setPage(1);
			}
			const params = buildParams({
				pageOverride,
				perPageOverride,
				searchAfterOverride,
				useCursorOverride,
			});
			const response = await api.get("/api/search", { params });
			const payload = response.data;
			setResults(payload.hits || []);
			setHitsCount(payload.hitsCount || 0);
			setNextSearchAfter(payload.nextSearchAfter || null);
		} catch (err) {
			const details = err.response?.data?.details;
			const message = err.response?.data?.error || err.message || "Search failed";
			setError(details ? `${message}: ${details.map((d) => d.message).join(", ")}` : message);
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = (event) => {
		event.preventDefault();
		runSearch({ resetCursor: true, resetPage: true, pageOverride: 1, searchAfterOverride: "" });
	};

	const onTokenChange = (event) => {
		const value = event.target.value.trim();
		setToken(value);
		if (value) {
			api.defaults.headers.common.Authorization = `Bearer ${value}`;
			window.localStorage.setItem("authToken", value);
		} else {
			delete api.defaults.headers.common.Authorization;
			window.localStorage.removeItem("authToken");
		}
	};

	const onNextPage = () => {
		if (useCursor) {
			if (!nextSearchAfter) {
				return;
			}
			const nextCursor = nextSearchAfter.join(",");
			setCursorStack((prev) => [...prev, searchAfter]);
			setSearchAfter(nextCursor);
			runSearch({ searchAfterOverride: nextCursor });
		} else {
			const nextPage = page + 1;
			setPage(nextPage);
			runSearch({ pageOverride: nextPage });
		}
	};

	const onPrevPage = () => {
		if (useCursor) {
			const prev = cursorStack[cursorStack.length - 1];
			if (prev === undefined) {
				return;
			}
			setCursorStack((stack) => stack.slice(0, -1));
			setSearchAfter(prev);
			runSearch({ searchAfterOverride: prev });
		} else {
			const nextPage = Math.max(1, page - 1);
			setPage(nextPage);
			runSearch({ pageOverride: nextPage });
		}
	};

	return (
		<div className="app">
			<header className="hero">
				<div className="hero__content">
					<p className="eyebrow">Elastic Search Console</p>
					<h1>Explore your logs with speed and clarity.</h1>
					<p className="subtitle">
						A focused console to query, filter, and paginate Elasticsearch data with a glassmorphism
						experience.
					</p>
					<div className="status">
						<span className={health?.ok ? "status__dot status__dot--ok" : "status__dot"} />
						<span>
							{health?.ok ? "Cluster healthy" : "Cluster status unknown"}
						</span>
					</div>
				</div>
				<div className="hero__panel">
					<div className="glass card">
						<h2>Indices snapshot</h2>
						<p className="muted">Latest indices detected on your cluster.</p>
						<div className="chip-grid">
							{indices.length === 0 && <span className="chip">No indices loaded</span>}
							{indices.slice(0, 10).map((item) => (
								<span key={item} className="chip">
									{item}
								</span>
							))}
						</div>
					</div>
				</div>
			</header>

			<main className="shell">
				<section className="glass card">
					<div className="card__header">
						<div>
							<h2>Search</h2>
							<p className="muted">Craft precise queries and paginate results safely.</p>
						</div>
						<button className="ghost" type="button" onClick={() => runSearch({ resetCursor: true })}>
							Refresh
						</button>
					</div>

					<form className="form" onSubmit={onSubmit}>
						<div className="field">
							<label>Index pattern</label>
							<input value={index} onChange={(event) => setIndex(event.target.value)} />
						</div>
						<div className="field field--wide">
							<label>Query</label>
							<input value={query} onChange={(event) => setQuery(event.target.value)} />
						</div>
						<div className="field">
							<label>Fields</label>
							<input value={fields} onChange={(event) => setFields(event.target.value)} />
						</div>
						<div className="field">
							<label>Mode</label>
							<select value={mode} onChange={(event) => setMode(event.target.value)}>
								<option value="match">Match</option>
								<option value="phrase_prefix">Phrase prefix</option>
							</select>
						</div>
						<div className="field">
							<label>Pagination</label>
							<div className="segmented">
								<button
									type="button"
									className={!useCursor ? "active" : ""}
									onClick={() => setUseCursor(false)}
								>
									Page
								</button>
								<button
									type="button"
									className={useCursor ? "active" : ""}
									onClick={() => setUseCursor(true)}
								>
									Cursor
								</button>
							</div>
						</div>
						{!useCursor ? (
							<>
								<div className="field">
									<label>Page</label>
									<input
										type="number"
										min="1"
										value={page}
										onChange={(event) => setPage(Number(event.target.value))}
									/>
								</div>
								<div className="field">
									<label>Per page</label>
									<input
										type="number"
										min="1"
										max="100"
										value={perPage}
										onChange={(event) => setPerPage(Number(event.target.value))}
									/>
								</div>
							</>
						) : (
							<>
								<div className="field">
									<label>Sort field</label>
									<input value={sortField} onChange={(event) => setSortField(event.target.value)} />
								</div>
								<div className="field">
									<label>Sort order</label>
									<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
										<option value="desc">Desc</option>
										<option value="asc">Asc</option>
									</select>
								</div>
							</>
						)}
						<div className="field field--wide">
							<label>Cursor (search_after)</label>
							<input
								value={searchAfter}
								onChange={(event) => setSearchAfter(event.target.value)}
								placeholder="auto-set after first search"
								disabled={!useCursor}
							/>
						</div>
						<div className="field field--wide">
							<label>JWT token</label>
							<input
								value={token}
								onChange={onTokenChange}
								placeholder="Bearer token"
								type="password"
							/>
						</div>
						<div className="field form__actions">
							<button className="primary" type="submit" disabled={loading}>
								{loading ? "Searching..." : "Run search"}
							</button>
						</div>
					</form>

					{error && <div className="alert">{error}</div>}
				</section>

				<section className="glass card">
					<div className="card__header">
						<div>
							<h2>Results</h2>
							<p className="muted">{hitsCount} hits found</p>
						</div>
						<div className="pager">
							<button type="button" className="ghost" onClick={onPrevPage}>
								Prev
							</button>
							<button type="button" className="ghost" onClick={onNextPage}>
								Next
							</button>
						</div>
					</div>

					<div className="results">
						{results.length === 0 && <p className="muted">No results yet. Run a search.</p>}
						{results.map((hit, hitIndex) => {
							const source = hit._source || {};
							return (
								<article key={hit._id || hitIndex} className="result">
									<div className="result__meta">
										<span className="chip">{hit._index}</span>
										<span className="muted">{source["@timestamp"] || "no timestamp"}</span>
									</div>
									<h3>{source.message || source.event?.action || "Log entry"}</h3>
									<div className="result__grid">
										<div>
											<p className="label">Source</p>
											<p>{source.source?.ip || source.source?.address || "-"}</p>
										</div>
										<div>
											<p className="label">Destination</p>
											<p>{source.destination?.ip || source.destination?.address || "-"}</p>
										</div>
										<div>
											<p className="label">Action</p>
											<p>{source.event?.action || source.rule?.name || "-"}</p>
										</div>
									</div>
									<pre>{JSON.stringify(source, null, 2)}</pre>
								</article>
							);
						})}
					</div>
				</section>
			</main>
		</div>
	);
};

export default App;